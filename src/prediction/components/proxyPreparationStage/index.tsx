import React from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DirectedStageEnum } from '../../enums/directedStageEnum';
import { currentStepState } from '../../store/currentStep';
import { PredictionCalculation } from '../../subModules/calculation';
import { PredictionPreparation } from '../../subModules/preparation';
import { PredictionWellGrid } from '../../subModules/wellGrid';

export const PredictionPreparationStage = () => {
    const step = useRecoilValue(currentStepState);

    return cond([
        [equals(DirectedStageEnum.Preparation), always(<PredictionPreparation />)],
        [equals(DirectedStageEnum.CreateModel), always(<PredictionWellGrid />)],
        [equals(DirectedStageEnum.WellGrid), always(<PredictionWellGrid />)],
        [equals(DirectedStageEnum.Calculation), always(<PredictionCalculation />)],
        [T, always(null)]
    ])(step);
};
