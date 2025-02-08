import React, { Suspense, useEffect } from 'react';

import { CalculationNotFound } from 'calculation/components/CalculationNotFound';
import { ActiveCalculationsListener } from 'calculation/entities/activeCalculationsListener';
import { isFinished } from 'calculation/entities/computation/computationStatus';
import { checkInsimBatchStatus } from 'calculation/gateways/gateway';
import { computationStatusState } from 'calculation/store/computationStatus';
import { initialSettings } from 'calculation/store/initialSettings';
import { modeParamsState, resultsAreAvailable } from 'calculation/store/insimCalcParams';
import { wellListState as optimizationWellListState } from 'optimization/store/wellList';
import { wellListState as predictionWellListState } from 'prediction/store/wellList';
import { DirectedStageEnum } from 'proxy/enums/directedStageEnum';
import { currentStep } from 'proxy/store/currentStep';
import { wellListState as proxyWellListState } from 'proxy/store/wellList';
import { getCalculationKeyFromQuery } from 'proxy/subModules/calculation/utils';
import { useSearchParams } from 'react-router-dom';
import { useRecoilRefresher_UNSTABLE, useResetRecoilState, useSetRecoilState } from 'recoil';

import { ContentContainer } from '../../../common/components/contentContainer';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { Spinner } from '../../../common/components/spinner';
import { ActionLinks } from '../../components/actionLinks';
import { ModuleStages } from '../../components/moduleStages';
import { MainContent } from './components/mainContent';

export const ProxyCalculation = () => {
    const [params] = useSearchParams();
    const setComputationState = useSetRecoilState(computationStatusState);
    const calcKey = getCalculationKeyFromQuery(new URLSearchParams(params));
    const refreshInitialSettings = useRecoilRefresher_UNSTABLE(initialSettings);
    const refreshProxyWellList = useRecoilRefresher_UNSTABLE(proxyWellListState);
    const refreshPredictionWellList = useRecoilRefresher_UNSTABLE(predictionWellListState);
    const refreshOptimizationWellList = useRecoilRefresher_UNSTABLE(optimizationWellListState);
    const resetModeParamsState = useResetRecoilState(modeParamsState);
    const setResultsAreAvailable = useSetRecoilState(resultsAreAvailable);
    const setStep = useSetRecoilState(currentStep);

    useEffect(() => {
        const calcListener = new ActiveCalculationsListener();
        setStep(DirectedStageEnum.Calculation);

        calcListener.start(async () => {
            const { data: calcStatus } = await checkInsimBatchStatus(calcKey);
            setComputationState(calcStatus);

            if (isFinished(calcStatus)) {
                refreshProxyWellList();
                refreshPredictionWellList();
                refreshOptimizationWellList();

                refreshInitialSettings();

                resetModeParamsState();

                setResultsAreAvailable(true);

                calcListener.stop();
            }
        });

        return () => calcListener.stop();
    }, []);

    return (
        <Page>
            <PageColumn>
                <Suspense fallback={<Spinner show={true} />}>
                    <NavigationPanel>
                        <Suspense fallback={<Spinner show={true} />}>
                            <ActionLinks />
                            <ModuleStages />
                        </Suspense>
                    </NavigationPanel>
                    <ContentContainer>
                        {calcKey ? (
                            <Suspense fallback={<Spinner show={true} />}>
                                <MainContent />
                            </Suspense>
                        ) : (
                            <CalculationNotFound />
                        )}
                    </ContentContainer>
                </Suspense>
            </PageColumn>
        </Page>
    );
};
