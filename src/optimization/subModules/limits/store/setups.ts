import { atom } from 'recoil';

import { WellSetupRaw } from '../entities/wellSetupRaw';

export const setupsState = atom<WellSetupRaw[]>({
    key: 'optimizationLimits__setupsState',
    default: []
});
