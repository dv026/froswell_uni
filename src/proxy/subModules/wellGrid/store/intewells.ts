import { atom } from 'recoil';

export const interwellsIsLoadingState = atom<boolean>({
    key: 'proxyWellGrid__interwellsIsLoadingState',
    default: false
});
