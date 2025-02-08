import { atom } from 'recoil';

export const showSavedResultState = atom<boolean>({
    key: 'filtration__showSavedResultState',
    default: false
});
