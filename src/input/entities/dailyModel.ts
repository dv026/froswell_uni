import { WithDate } from './merModel';

export class DailyModel implements WithDate {
    public dt: Date;
    public oilRate: number;
    public liqRate: number;
    public watercutVolume: number;
    public intakeLiqrate: number;
    public dynLevel: number;
    public pressureZab: number;
    public wellsInWork: number;
}
