import { atom } from 'recoil';

export const indentState = atom<number>({
    key: 'inputTablet__indentState',
    default: 1000
});
