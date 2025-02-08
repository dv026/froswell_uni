import { atom } from 'recoil';

export const chartCompareSyncMode = atom<boolean>({
    key: 'input__chartCompareSyncMode',
    default: true
});
