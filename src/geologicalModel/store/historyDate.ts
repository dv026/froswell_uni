import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'geologicalModel__historyDateState',
    default: null
});
