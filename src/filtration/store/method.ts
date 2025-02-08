import { atom } from 'recoil';

import { MethodEnum } from '../enums/methodEnum';

export const methodState = atom<MethodEnum>({
    key: 'filtration__methodState',
    default: MethodEnum.Cluster
});
