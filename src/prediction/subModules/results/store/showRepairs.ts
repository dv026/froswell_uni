import { atom } from 'recoil';

export const showRepairsState = atom<boolean>({
    key: 'predictionResults__showRepairsState',
    default: false
});
