import { atom } from 'recoil';

import { DataTypeEnum } from '../../common/enums/dataTypeEnum';

export const dataTypeState = atom<DataTypeEnum>({
    key: 'filtration__dataTypeState',
    default: DataTypeEnum.Mer
});
