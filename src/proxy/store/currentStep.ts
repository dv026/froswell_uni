import { atom, selector } from 'recoil';

import { currentPlastId } from '../../calculation/store/currentPlastId';
import { DirectedStageEnum } from '../enums/directedStageEnum';

const currentStepState = atom<DirectedStageEnum>({
    key: 'proxy__currentStepState',
    default: DirectedStageEnum.Preparation
});

export const currentStep = selector<DirectedStageEnum>({
    key: 'proxy__currentStep',
    get: async ({ get }) => {
        return get(currentStepState);
    },
    set: ({ set, reset }, newValue: DirectedStageEnum) => {
        set(currentStepState, newValue);

        reset(currentPlastId);
    }
});
