import React, { FC, Suspense } from 'react';

import { useRecoilValue } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { Spinner } from '../../../../common/components/spinner';
import { isLoadingState } from '../../../../prediction/subModules/model/store/subScenarioMutations';
import { ToolMapControls as PredictionToolMapControls } from '../../../../prediction/subModules/wellGrid/components/toolMapControls';
import { ModuleMap } from '../../../../proxy/components/moduleMap';
import { MapCurtain } from '../../../../proxy/components/moduleMap/mapCurtain';
import { DirectedStageEnum } from '../../../enums/directedStageEnum';
import { currentStepState } from '../../../store/currentStep';
import { WellGroupsCurtain } from '../../wellGroup/components/wellGroupsCurtain';
import { ToolMapControls } from './toolMapControls';

export const ModuleMapWrapper = () => {
    const step = useRecoilValue(currentStepState);
    const isLoading = useRecoilValue(isLoadingState);

    const isWellGrid = step === DirectedStageEnum.WellGrid;
    const isWellGroup = step === DirectedStageEnum.WellGroup;

    return (
        <>
            <Spinner show={isLoading} />
            <Suspense fallback={<Spinner show={true} />}>
                <MapCurtain />
            </Suspense>
            {isWellGrid ? <PredictionToolMapControls /> : null}
            {isWellGroup ? (
                <>
                    <ToolMapControls />
                    <WellGroupsCurtain />
                </>
            ) : null}
            <Suspense fallback={<Spinner show={true} />}>
                <ModuleMap mode={CalculationModeEnum.Optimization} isWellGrid={isWellGrid} isWellGroup={isWellGroup} />
            </Suspense>
        </>
    );
};
