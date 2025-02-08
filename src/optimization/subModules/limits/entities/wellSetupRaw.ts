export interface WellSetupRaw {
    dt: Date;
    wellId: number;
    wellName: string;
    liqRate: number;
    oilRate: number;
    volumeWaterCut: number;
    pressureZab: number;
    bubblePointPressure: number;
    charWorkId: number;
    minPressureZab: number;
    maxPressureZab: number;
}
