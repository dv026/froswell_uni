import { BatchStatus } from '../../../common/entities/batchStatus';

export class ImprovementBatchStatus extends BatchStatus {
    public a: number;
    public currentEfficiency: number;
    public maxEfficiency: number;
    public scenarioID: number;
    public scenarioName: number;
    public stepNumber: number;
    public wellID: number;
    public minX: number;
    public maxX: number;
    public minY: number;
    public maxY: number;
    public aNumber: number;
}
