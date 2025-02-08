import { WithDate } from './merModel';

export class MerPlusDailyModel implements WithDate {
    public dt: Date;
    public oilTonnesRate: number;
    public oilRate: number;

    public liquidVolumeRate: number;
    public liqRate: number;

    public injectionRate: number;
    public intakeLiqrate: number;

    public watercutVolumeMer: number;
    public watercutVolumeDaily: number;

    public pressureZabMer: number;
    public pressureZabDaily: number;

    public wellsInWork: number;

    public constructor(
        dt: Date,
        oilRate1: number,
        oilRate2: number,
        liqRate1: number,
        liqRate2: number,
        injectionRate1: number,
        injectionRate2: number,
        watercutVolume1: number,
        watercutVolume2: number,
        pressureZab1: number,
        pressureZab2: number,
        wellsInWork: number
    ) {
        this.dt = dt;
        this.oilTonnesRate = oilRate1;
        this.oilRate = oilRate2;

        this.liquidVolumeRate = liqRate1;
        this.liqRate = liqRate2;

        this.injectionRate = injectionRate1;
        this.intakeLiqrate = injectionRate2;

        this.watercutVolumeMer = watercutVolume1;
        this.pressureZabDaily = watercutVolume2;

        this.pressureZabMer = pressureZab1;
        this.pressureZabDaily = pressureZab2;

        this.wellsInWork = wellsInWork;
    }
}
