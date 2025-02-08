import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'input__historyDateState',
    default: null
});
