import { atom } from 'recoil';

export const userNameState = atom<string>({
    key: 'identity__userNameState',
    default: ''
});
