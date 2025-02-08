import { atom } from 'recoil';

import { DirectedStageEnum } from '../enums/directedStageEnum';

export const currentStepState = atom<DirectedStageEnum>({
    key: 'prediction__currentStepState',
    default: DirectedStageEnum.Preparation
});
