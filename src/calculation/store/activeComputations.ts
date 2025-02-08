import { ComputationStatusBrief } from 'calculation/entities/computation/computationStatus';
import { atom } from 'recoil';

export const activeComputationsState = atom<ComputationStatusBrief[]>({
    key: 'calculation__activeComputations',
    default: []
});
