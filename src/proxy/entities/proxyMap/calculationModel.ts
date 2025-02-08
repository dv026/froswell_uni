import { Point } from '../../../common/entities/canvas/point';

export class CalculationModel {
    public angle1: number;
    public dist: number;
    public distContours: number;
    public distOldWells: number;
    public oilFieldId: number;
    public plastId: number;
    public pointMax: number;
    public productionObjectId: number;
    public removeOldVirtualWells: boolean;
    public scenarioId: number;
    public selectedPolygon: Point[];
    public startNumber: number;
    public type: WellGridCalculationEnum;
    public x: number;
    public y: number;

    public constructor(
        scenarioId: number,
        oilFieldId: number,
        productionObjectId: number,
        plastId: number,
        x: number,
        y: number,
        selectedPolygon: Point[]
    ) {
        this.scenarioId = scenarioId;
        this.oilFieldId = oilFieldId;
        this.productionObjectId = productionObjectId;
        this.plastId = plastId;
        this.x = x;
        this.y = y;
        this.dist = 450;
        this.distOldWells = 400;
        this.distContours = 150;
        this.pointMax = 800;
        this.angle1 = 45;
        this.type = WellGridCalculationEnum.SevenPoint;
        this.startNumber = 100000;
        this.removeOldVirtualWells = false;
        this.selectedPolygon = selectedPolygon;
    }
}

export enum WellGridCalculationEnum {
    SevenPoint = 1,
    Square = 2,
    Mitchell = 3,
    Mitchell3 = 4,
    Poisson = 5
}
