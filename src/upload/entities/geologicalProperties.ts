export class GeologicalProperties {
    public plastId: number;
    public initialPressure: number;
    public bubblePointPressure: number;
    public initialWaterSaturation: number;
    public residualOilSaturation: number;
    public geologicalReserves: number;

    public constructor(plastId: number) {
        this.plastId = plastId;
        this.initialPressure = 0;
        this.bubblePointPressure = 0;
        this.initialWaterSaturation = 0;
        this.residualOilSaturation = 0;
        this.geologicalReserves = 0;
    }
}
