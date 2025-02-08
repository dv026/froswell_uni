import { WellTypeEnum } from 'common/enums/wellTypeEnum';

export class VariationLossesModel {
    public plastId: number;
    public wellId: number;
    public wellName: string;
    public wellType: WellTypeEnum;
    public x: number;
    public y: number;
    public variationVolumeWaterCut: number;
    public variationLiquid: number;
}
