import React, { FC, Suspense } from 'react';

import { useRecoilValue } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { Spinner } from '../../../../common/components/spinner';
import { ModuleMap } from '../../../../proxy/components/moduleMap';
import { MapCurtain } from '../../../../proxy/components/moduleMap/mapCurtain';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { isLoadingState } from '../../model/store/subScenarioMutations';
import { LegendTool } from './legendTool';
import { ToolMapControls } from './toolMapControls';

export const ModuleMapWrapper = () => {
    const step = useRecoilValue(currentStepState);
    const isLoading = useRecoilValue(isLoadingState);

    const isWellGrid = step === DirectedStageEnum.WellGrid;

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain />
            </Suspense>
            {isWellGrid && (
                <>
                    <ToolMapControls />
                    <LegendTool />
                </>
            )}
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleMap mode={CalculationModeEnum.Prediction} isWellGrid={isWellGrid} />
            </Suspense>
        </>
    );
};
