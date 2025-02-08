import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'predictionResults__historyDateState',
    default: null
});
