import { atom } from 'recoil';

import { FundTypeEnum } from '../../../common/enums/fundTypeEnum';

export const wellStockState = atom<FundTypeEnum[]>({
    key: 'proxyMap__wellStockState',
    default: [FundTypeEnum.ActiveStock, FundTypeEnum.DrilledFoundation, FundTypeEnum.VirtualWells]
});
