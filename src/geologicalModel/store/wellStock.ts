import { atom } from 'recoil';

import { FundTypeEnum } from '../../common/enums/fundTypeEnum';

export const wellStockState = atom<FundTypeEnum[]>({
    key: 'geologicalModel__wellStockState',
    default: [FundTypeEnum.ActiveStock, FundTypeEnum.DrilledFoundation]
});
