import { atom } from 'recoil';

export const historyDateState = atom<Date>({
    key: 'proxyResults__historyDateState',
    default: null
});
