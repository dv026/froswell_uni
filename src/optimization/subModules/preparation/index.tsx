import React, { FC, Suspense, useEffect } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { SubModuleType } from '../../../calculation/enums/subModuleType';
import { calculationModeState } from '../../../calculation/store/calculationMode';
import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { ContentContainer } from '../../../common/components/contentContainer';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { PageRoster } from '../../../common/components/pageRoster';
import { SkeletonWellRoster } from '../../../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../../../common/components/spinner';
import { ModuleStages } from '../../components/moduleStages';
import { submoduleState } from '../../store/submodule';
import { ActionLinks } from './components/actionLinks';
import { BasicSettings } from './components/basicSettings';
import { WellList } from './components/wellList';

export const OptimizationPreparation = () => {
    const setCalculationMode = useSetRecoilState(calculationModeState);
    const setSubmodule = useSetRecoilState(submoduleState);

    const resetCurrentPlastId = useResetRecoilState(currentPlastId);

    useEffect(() => {
        resetCurrentPlastId();

        setSubmodule(SubModuleType.Calculation);
        setCalculationMode(CalculationModeEnum.Prediction); // todo mb Optimization?
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Page>
            <PageRoster>
                <Suspense fallback={<SkeletonWellRoster />}>
                    <WellList />
                </Suspense>
            </PageRoster>
            <PageColumn>
                <NavigationPanel>
                    <Suspense fallback={<Spinner show={true} />}>
                        <ActionLinks />
                        <ModuleStages />
                    </Suspense>
                </NavigationPanel>
                <ContentContainer>
                    <Suspense fallback={<Spinner show={true} />}>
                        <BasicSettings />
                    </Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};
