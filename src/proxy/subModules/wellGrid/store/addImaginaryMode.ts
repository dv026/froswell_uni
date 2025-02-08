import { atom } from 'recoil';

export const addImaginaryModeState = atom<boolean>({
    key: 'proxyWellGrid__addImaginaryModeState',
    default: false
});
