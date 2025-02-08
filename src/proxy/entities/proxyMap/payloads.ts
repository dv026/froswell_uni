import { FundTypeEnum } from '../../../common/enums/fundTypeEnum';

export interface UpdateStockPayload {
    add: boolean;
    type: FundTypeEnum;
}

export interface EditGroupsModePayload {
    show: boolean;
    clearInAdd: boolean;
}
