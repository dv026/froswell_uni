import { BatchStatus } from '../../../common/entities/batchStatus';

export class CalculationSubScenariosModel {
    public batchStatus: BatchStatus;
    public cleanAllData: boolean;
    public dist: number;
    public drillingRate: number;
    public drillingStartDate: Date;
    public intervalInjection: number;
    public monthInjectionStart: number;
    public numberSubScenarios: number;
    public plastId: number;
    public productionObjectId: number;
    public scenarioId: number;

    public constructor() {
        this.batchStatus = null;
        this.cleanAllData = true;
        this.dist = 450;
        this.drillingRate = 1;
        this.intervalInjection = 120;
        this.monthInjectionStart = 24;
        this.numberSubScenarios = 6;
    }
}
