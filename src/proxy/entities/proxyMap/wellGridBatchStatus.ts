import { BatchStatus } from '../../../common/entities/batchStatus';

export class WellGridBatchStatus extends BatchStatus {
    public stepName: string;
    public currentNumber: number;
    public totalCount: number;
    public loopNumber: number;
}
