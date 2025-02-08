import { WellPoint } from '../../common/entities/wellPoint';
import { DataTypeEnum } from '../../common/enums/dataTypeEnum';
import { ModeTypeEnum } from '../../common/enums/modeType';
import { DailyModel } from './dailyModel';
import { MerState } from './merModel';
import { MerPlusDailyModel } from './merPlusDailyModel';

export class ChartDataModel {
    public dataMers: MerState[];
    public dataDaily: DailyModel[];
    public dataMerPlusDaily: MerPlusDailyModel[];
    public dataType: DataTypeEnum;
    public modeType: ModeTypeEnum;
    public showRepairs: boolean;
    public selectedWells: WellPoint[];

    public constructor() {
        this.dataType = DataTypeEnum.Mer;
        this.modeType = ModeTypeEnum.Daily;

        this.dataMers = [];
        this.dataDaily = [];
    }
}
