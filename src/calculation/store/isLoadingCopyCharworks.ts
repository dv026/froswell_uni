import { atom } from 'recoil';

export const isLoadingCopyCharworks = atom<boolean>({
    key: 'calculation__isLoadingCopyCharworks',
    default: false
});
