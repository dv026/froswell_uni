import { atom } from 'recoil';

export const currentPlastIdState = atom<number>({
    key: 'optimizationTargets__currentPlastIdState',
    default: null
});
