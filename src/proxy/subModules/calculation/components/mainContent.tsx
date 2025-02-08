import React, { useState } from 'react';

import { Box, Divider, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { AdaptationTypeEnum } from 'calculation/entities/computation/adaptationTypeEnum';
import { ErrorsChart } from 'proxy/subModules/calculation/components/errorsChart';
import { find, isNil, last, not } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { AdaptationDynamics } from '../../../../calculation/entities/computation/calculationDetails';
import {
    ComputationStatus,
    isFinished,
    isInProgress
} from '../../../../calculation/entities/computation/computationStatus';
import { SubModuleType } from '../../../../calculation/enums/subModuleType';
import { computationStatusState } from '../../../../calculation/store/computationStatus';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { useInsimMutations } from '../../../../calculation/store/insimMutations';
import { EmptyData } from '../../../../common/components/emptyData';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { RouteEnum } from '../../../../common/enums/routeEnum';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import * as router from '../../../../common/helpers/routers/proxyRouter';
import { cls } from '../../../../common/helpers/styles';
import { mapSettingsState as optimizationMapSettingsState } from '../../../../optimization/subModules/results/store/mapSettings';
import { siteDetailsState } from '../../../../optimization/subModules/results/store/siteDetails';
import { mapSettingsState as predictionMapSettingsState } from '../../../../prediction/subModules/results/store/mapSettings';
import { wellDetailsState } from '../../../../prediction/subModules/results/store/wellDetails';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStep } from '../../../store/currentStep';
import { submoduleState } from '../../../store/submodule';
import { currentSpot } from '../../../store/well';
import { mapSettingsState as proxyMapSettingsState } from '../../results/store/mapSettings';
import { reportState } from '../../results/store/report';
import { AdaptationCard } from './adaptationCard';
import { AdaptationChart } from './adaptationChart';
import { CalculationProgress } from './calculationProgress';
import { ErrorsTab } from './errorsTab';

import css from './calculation.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const batchInProgress = (computationStatus: ComputationStatus): boolean =>
    isInProgress(computationStatus) || isFinished(computationStatus);

const batchFinished = (computation: ComputationStatus) => isFinished(computation);

export const MainContent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const computationStatus = useRecoilValue(computationStatusState);
    const scenarioId = useRecoilValue(currentScenarioId);
    const spot = useRecoilValue(currentSpot);

    const setCurrentStep = useSetRecoilState(currentStep);
    const setSubmodule = useSetRecoilState(submoduleState);

    const dispatcher = useInsimMutations();

    const [currentAdaptation, setCurrentAdaptation] = useState<AdaptationDynamics>(null);

    const allowDetailsStatus = !isNil(computationStatus);

    const allowResults =
        batchInProgress(computationStatus) && !isNullOrEmpty(computationStatus.details.adaptationDynamics);

    const toResults = useRecoilCallback(({ refresh }) => () => {
        const well = new WellBrief(spot.oilFieldId, null, spot.prodObjId, null, scenarioId);

        setSubmodule(SubModuleType.Results);
        setCurrentStep(DirectedStageEnum.Preparation);

        navigate(router.to(RouteEnum.ProxyResults, well));

        // очистить кэш приложения
        refresh(reportState);
        refresh(wellDetailsState);
        refresh(siteDetailsState);

        refresh(proxyMapSettingsState);
        refresh(predictionMapSettingsState);
        refresh(optimizationMapSettingsState);
    });

    const updateCurrentA = (a: number) => {
        const a1 = a || -1;
        const a2 = isNil(currentAdaptation) ? -1 : currentAdaptation.a;

        if (a1 !== a2) {
            setCurrentAdaptation(
                isNil(a) ? null : find(x => x.a === a, computationStatus.details.adaptationDynamics || [])
            );
        }
    };

    const renderChart = () => {
        if (!batchInProgress(computationStatus) || isNullOrEmpty(computationStatus.details.adaptationDynamics)) {
            return <EmptyData text={t(dict.calculation.tipWaitForChart)} />;
        }

        return (
            <div className={cls([css.calculation__infoSide, css.calculation__infoSide_chart])}>
                <AdaptationChart
                    details={computationStatus.details}
                    onCurrentAdaptationChange={a => updateCurrentA(a)}
                />
            </div>
        );
    };

    const renderInfo = () => {
        if (!batchInProgress(computationStatus) || isNullOrEmpty(computationStatus.details.adaptationDynamics)) {
            return null;
        }

        const bestAdaptation = find(x => x.isBestNow, computationStatus.details.adaptationDynamics || []);
        const lastAdaptation = last(computationStatus.details.adaptationDynamics || []);

        return (
            <div className={cls([css.calculation__infoSide, css.calculation__infoSide_cards])}>
                <AdaptationCard adaptation={bestAdaptation} best={null} title={t(dict.proxy.bestAdaptation)} />
                <AdaptationCard
                    adaptation={currentAdaptation || lastAdaptation}
                    best={bestAdaptation}
                    title={!!currentAdaptation ? t(dict.proxy.graphicalAdaptation) : t(dict.proxy.lastAdaptation)}
                />
            </div>
        );
    };

    const renderByWellErrors = () => {
        if (!batchInProgress(computationStatus) || isNullOrEmpty(computationStatus.details.wellErrors)) {
            return <EmptyData />;
        }

        // TIP: бизнес-логика предполагает, что orderNumber может присутствовать только при адаптации геомодели,
        //  так как на каждой итерации адаптируется только одна конкретная скважина.
        const orderNumber =
            computationStatus.details.type === AdaptationTypeEnum.GeoModel &&
            not(isNil(computationStatus.details.unitId))
                ? findCurrentOrderNumber(computationStatus)
                : 0;

        return (
            <ErrorsTab
                orderNumber={orderNumber}
                rows={computationStatus.details.wellErrors}
                isFinished={batchFinished(computationStatus)}
            />
        );
    };

    const renderErrorsChart = () => {
        if (!batchInProgress(computationStatus) || isNullOrEmpty(computationStatus.details.wellErrors)) {
            return <EmptyData />;
        }

        return (
            <div className={cls([css.calculation__infoSide, css.calculation__infoSide_chart])}>
                <ErrorsChart
                    dynamics={computationStatus.details.adaptationDynamics}
                    minA={computationStatus.details.minA}
                    maxA={computationStatus.details.maxA}
                />
            </div>
        );
    };

    const abortInsim = () => {
        dispatcher.abort();
    };

    return (
        <Box p='20px' w='100%' h='100%'>
            <CalculationProgress toResults={toResults} abort={abortInsim} collapsed={allowResults} />
            <Divider />
            <Tabs isLazy>
                <TabList>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.common.chart)}</Tab>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.proxy.errorTable)}</Tab>
                    <Tab isDisabled={!allowDetailsStatus}>{t(dict.proxy.errorsByType.tabName)}</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Box className={css.calculation}>
                            {renderChart()}
                            {renderInfo()}
                        </Box>
                    </TabPanel>
                    <TabPanel>{renderByWellErrors()}</TabPanel>
                    <TabPanel>
                        <Box className={css.calculation}>
                            {renderErrorsChart()}
                            {renderInfo()}
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

const findCurrentOrderNumber = (computationStatus: ComputationStatus): number => {
    // Получить Ид улучшаемой на текущей итерации скважины из Ид юнита.
    const wellId = parseInt(computationStatus.details.unitId.split('_')[0]);
    return find(x => x.id === wellId, computationStatus.details.wellErrors).orderNumber;
};
