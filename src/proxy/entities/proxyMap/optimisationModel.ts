import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { OptimisationBriefType } from '../../../prediction/subModules/wellGrid/components/optimization/dataManager';
import { UpdateOptimisationModel } from './updateOptimisationModel';

export class OptimisationModel {
    public wellId: number;
    public plastId: number;
    public wellType: number;
    public minPressureZab: number;
    public maxPressureZab: number;
    public defaultPressureZab: number;
    public currentPressureZab: number;
    public bubblePointPressure: number;

    public constructor(
        wellId: number,
        plastId: number,
        wellType: WellTypeEnum,
        min: number,
        max: number,
        defaultValue: number,
        currentValue: number,
        bubblePointPressure: number
    ) {
        this.wellId = wellId;
        this.plastId = plastId;
        this.wellType = wellType;
        this.minPressureZab = min;
        this.maxPressureZab = max;
        this.defaultPressureZab = defaultValue;
        this.currentPressureZab = currentValue;
        this.bubblePointPressure = bubblePointPressure;
    }

    public static copy(opt: OptimisationModel, model: UpdateOptimisationModel): OptimisationModel {
        return new OptimisationModel(
            opt.wellId,
            opt.plastId,
            model.wellType,
            opt.minPressureZab,
            opt.maxPressureZab,
            opt.defaultPressureZab,
            model.value,
            opt.bubblePointPressure
        );
    }

    public static copyWithPlast(
        defaultOpt: OptimisationBriefType,
        model: UpdateOptimisationModel,
        plastId: number
    ): OptimisationModel {
        return new OptimisationModel(
            model.wellId,
            plastId,
            model.wellType,
            defaultOpt.minValue,
            defaultOpt.maxValue,
            defaultOpt.defaultValue,
            model.value,
            defaultOpt.additionalValue
        );
    }
}
