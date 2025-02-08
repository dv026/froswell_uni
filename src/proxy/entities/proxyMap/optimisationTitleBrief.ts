import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { OptimisationParamEnum } from '../../enums/wellGrid/optimisationParam';

export class OptimisationTitleBrief {
    public parameter: OptimisationParamEnum;
    public wellId: number;
    public wellType: WellTypeEnum;
    public value: number;
    public newValue: number;

    public constructor(
        parameter: OptimisationParamEnum,
        wellId: number,
        wellType: WellTypeEnum,
        value: number,
        newValue: number = null
    ) {
        this.parameter = parameter;
        this.wellId = wellId;
        this.wellType = wellType;
        this.value = value;
        this.newValue = newValue;
    }
}
