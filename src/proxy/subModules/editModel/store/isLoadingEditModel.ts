import { atom } from 'recoil';

export const isLoadingEditModelState = atom<boolean>({
    key: 'proxyEditModel__isLoadingEditModelState',
    default: false
});
