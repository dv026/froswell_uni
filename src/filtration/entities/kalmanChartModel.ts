import { CalcModelEnum } from '../enums/calcModelEnum';
import { ChartParams } from '../enums/inputParamEnum';
import { MethodEnum } from '../enums/methodEnum';

export class KalmanChartModel {
    public method: MethodEnum;
    public parameter: ChartParams;
    public calcModel: CalcModelEnum;
    public qt: number;
    public rt: number;
    public defaultPt: number;
    public discreteQ1: number;
    public discreteQ2: number;
    public discreteQ3: number;
    public discreteQ4: number;
    public smoothLevel: number;

    public constructor() {
        this.method = MethodEnum.Kalman;
        this.parameter = 'All';
        this.calcModel = CalcModelEnum.Variable;
        this.qt = 0.1;
        this.rt = 50;
        this.defaultPt = 1000;
        this.smoothLevel = 5;
    }
}
