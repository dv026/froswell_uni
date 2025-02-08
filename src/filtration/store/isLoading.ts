import { atom } from 'recoil';

export const isLoadingState = atom<boolean>({
    key: 'filtration__isLoadingState',
    default: false
});
