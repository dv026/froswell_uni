export class KalmanSavedResult {
    public dt: Date;
    public liquidVolumeRate: number;
    public watercutVolume: number;
    public pressureZab: number;
}

export class KalmanDetailsModel {
    public kalmanData: KalmanModel[];
    public kalmanSavedResult: KalmanSavedResult[];
}

export class DayState {
    public date: Date;
    public liquid: number;
    public liquidAvg: number;
    public oil: number;
    public oilAvg: number;

    public constructor(date: Date, liquid: number, liquidAvg: number, oil: number, oilAvg: number) {
        this.date = date;
        this.liquid = liquid;
        this.liquidAvg = liquidAvg;
        this.oil = oil;
        this.oilAvg = oilAvg;
    }
}

export class KalmanModel {
    public dt: Date;
    public liquidVolumeRateOld: number;
    public liquidVolumeRate: number;
    public watercutVolumeOld: number;
    public watercutVolume: number;
    public wressureZabOld: number;
    public wressureZab: number;
}
