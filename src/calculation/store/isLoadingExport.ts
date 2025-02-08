import { atom } from 'recoil';

export const isLoadingExportState = atom<boolean>({
    key: 'calculation__isLoadingExportState',
    default: false
});
