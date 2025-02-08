import { atom } from 'recoil';

export const isLoadingExportState = atom<boolean>({
    key: 'inputEfficiency__isLoadingExportState',
    default: false
});
