// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanvasSize } from '../../common/entities/canvas/canvasSize';
import { ContourModelBrief } from '../../common/entities/contourModelBrief';
import { KeyValue } from '../../common/entities/keyValue';
import { AccumulatedFlow } from '../../common/entities/mapCanvas/accumulatedFlow';
import { CompensationModel } from '../../common/entities/mapCanvas/compensationModel';
import { WellPointDonut } from '../../common/entities/wellPoint';
import { DataTypeEnum } from '../../common/enums/dataTypeEnum';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { InflowProfileMapModel } from './inflowProfileMapModel';

export class MapSettingModel {
    public accumulatedFlows: AccumulatedFlow;
    public availableGrids: GridMapEnum[];
    public canvasSize: CanvasSize;
    public compensations: CompensationModel[];
    public contour: any;
    public contour2: ContourModelBrief[];
    public dataType: DataTypeEnum;
    public drilledFoundationPoints: WellPointDonut[];
    public flowInterwells: number[][][];
    public inflowProfiles: InflowProfileMapModel[];
    public krigingPeriod: Date[];
    public mapHistoryRange: any;
    public pieScale: number;
    public plastDict: KeyValue[];
    public points: WellPointDonut[];
    public previousGridMap: GridMapEnum;
    public prodObjDict: KeyValue[];
    public radius: number;
    public tracerResearches: AccumulatedFlow;

    public constructor(radius: number = 1200) {
        this.compensations = [];
        this.dataType = DataTypeEnum.Mer;
        this.inflowProfiles = [];
        this.points = null;
        this.radius = radius;
        this.pieScale = 1;
        this.drilledFoundationPoints = [];
    }
}
