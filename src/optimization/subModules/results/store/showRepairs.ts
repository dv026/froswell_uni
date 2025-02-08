import { atom } from 'recoil';

export const showRepairsState = atom<boolean>({
    key: 'optimizationResults__showRepairsState',
    default: false
});
