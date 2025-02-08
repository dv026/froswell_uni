import React from 'react';

import { always, cond, equals, T } from 'ramda';
import { useRecoilValue } from 'recoil';

import { DirectedStageEnum } from '../../enums/directedStageEnum';
import { currentStep } from '../../store/currentStep';
import { ProxyCalculation } from './../../subModules/calculation';
import { ProxyPermeabilities } from './../../subModules/permeabilities';
import { ProxyPreparation } from './../../subModules/preparation';
import { ProxyWellGrid } from './../../subModules/wellGrid';

export const ProxyPreparationStage = () => {
    const step = useRecoilValue(currentStep);

    return cond([
        [equals(DirectedStageEnum.Preparation), always(<ProxyPreparation />)],
        [equals(DirectedStageEnum.CreateModel), always(<ProxyWellGrid />)],
        [equals(DirectedStageEnum.EditModel), always(<ProxyWellGrid />)],
        [equals(DirectedStageEnum.WellGrid), always(<ProxyWellGrid />)],
        [equals(DirectedStageEnum.WellGroup), always(<ProxyWellGrid />)],
        [equals(DirectedStageEnum.Permeability), always(<ProxyPermeabilities />)],
        // [equals(DirectedStageEnum.Calculation), always(<ProxyCalculation />)],
        [T, always(null)]
    ])(step);
};
