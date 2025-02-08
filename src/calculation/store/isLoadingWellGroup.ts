import { atom } from 'recoil';

export const isLoadingWellGroupState = atom<boolean>({
    key: 'calculation__isLoadingWellGroupState',
    default: false
});
