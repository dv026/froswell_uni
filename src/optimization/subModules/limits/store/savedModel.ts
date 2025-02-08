import { atom } from 'recoil';

import { WellSetupModel } from '../entities/wellSetupModel';

export const savedModelState = atom<WellSetupModel[]>({
    key: 'optimizationLimits__savedModelState',
    default: []
});
