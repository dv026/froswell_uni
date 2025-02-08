import { atom } from 'recoil';

import { FundTypeEnum } from '../../../common/enums/fundTypeEnum';

export const wellStockState = atom<FundTypeEnum[]>({
    key: 'input__wellStockState',
    default: [FundTypeEnum.ActiveStock, FundTypeEnum.DrilledFoundation]
});
