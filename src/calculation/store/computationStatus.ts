import { atom } from 'recoil';

import { ComputationStatus } from '../entities/computation/computationStatus';

export const computationStatusState = atom<ComputationStatus>({
    key: 'calculation__computationStatusState',
    default: null
});
