import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'optimizationResults__historyDateState',
    default: null
});
