import { atom } from 'recoil';

export const selectedAdditionalWellState = atom<string>({
    key: 'calculation__selectedAdditionalWellState',
    default: ''
});
