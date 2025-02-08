import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'efficiencyResults__historyDateState',
    default: null
});
