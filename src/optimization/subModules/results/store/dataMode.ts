import { atom } from 'recoil';

import { DataModeEnum } from '../enums/dataModeEnum';

export const dataModeState = atom<DataModeEnum>({
    key: 'optimizationResults__dataModeState',
    default: DataModeEnum.BestMainO
});
