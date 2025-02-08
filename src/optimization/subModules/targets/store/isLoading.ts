import { atom } from 'recoil';

export const isLoadingState = atom<boolean>({
    key: 'optimizationTargets__isLoadingState',
    default: false
});
