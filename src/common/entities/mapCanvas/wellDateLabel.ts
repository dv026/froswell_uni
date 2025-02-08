import { FundTypeEnum } from '../../enums/fundTypeEnum';

export class WellDateLabel {
    public type: FundTypeEnum;
    public param: WellDateEnum;
    public value: boolean;

    public constructor(type: FundTypeEnum, param: WellDateEnum, value: boolean) {
        this.type = type;
        this.param = param;
        this.value = value;
    }
}

export enum WellDateEnum {
    StartDate = 'startDate',
    ClosingDate = 'closingDate',
    Trajectory = 'trajectory'
}
