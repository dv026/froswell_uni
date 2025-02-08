import React from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DirectedStageEnum } from '../../enums/directedStageEnum';
import { currentStepState } from '../../store/currentStep';
import { OptimizationCalculation } from './../../subModules/calculation';
import { OptimizationLimits } from './../../subModules/limits';
import { OptimizationPreparation } from './../../subModules/preparation';
import { OptimizationTargets } from './../../subModules/targets';
import { OptimizationWellGrid } from './../../subModules/wellGrid';

export const OptimizationPreparationStage = () => {
    const step = useRecoilValue(currentStepState);

    return cond([
        [equals(DirectedStageEnum.Preparation), always(<OptimizationPreparation />)],
        [equals(DirectedStageEnum.CreateModel), always(<OptimizationWellGrid />)],
        [equals(DirectedStageEnum.WellGrid), always(<OptimizationWellGrid />)],
        [equals(DirectedStageEnum.WellGroup), always(<OptimizationWellGrid />)],
        [equals(DirectedStageEnum.Limits), always(<OptimizationLimits />)],
        [equals(DirectedStageEnum.Tagrets), always(<OptimizationTargets />)],
        // [equals(DirectedStageEnum.Calculation), always(<OptimizationCalculation />)],
        [T, always(null)]
    ])(step);
};
