import { atom } from 'recoil';

export const showRepairsState = atom<boolean>({
    key: 'input__showRepairsState',
    default: false
});
