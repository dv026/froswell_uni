import { atom } from 'recoil';

export const hiddenLinesState = atom<string[]>({
    key: 'proxyResults__hiddenLinesState',
    default: []
});
