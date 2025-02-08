import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { OptimisationParamEnum } from '../../enums/wellGrid/optimisationParam';

export class UpdateOptimisationModel {
    public wellId: number;
    public wellType: WellTypeEnum;
    public parameter: OptimisationParamEnum;
    public value: number;

    public constructor(wellId: number, wellType: WellTypeEnum, parameter: OptimisationParamEnum, value: number) {
        this.wellId = wellId;
        this.wellType = wellType;
        this.parameter = parameter;
        this.value = value;
    }
}
