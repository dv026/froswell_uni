import { atom } from 'recoil';

export const showRepairsState = atom<boolean>({
    key: 'proxyResults__showRepairsState',
    default: false
});
