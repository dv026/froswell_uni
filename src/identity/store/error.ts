import { atom } from 'recoil';

export const errorState = atom<string>({
    key: 'identity__errorState',
    default: ''
});
