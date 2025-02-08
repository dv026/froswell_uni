import { isTruthy } from '../helpers/ramda';
import { ProcessingStatusEnum } from './processingStatusEnum';

export class BatchStatus {
    public id: number;

    public jobName: string;
    public createDate: Date;
    public finishDate: Date;
    public statusId: ProcessingStatusEnum;
    public completePercent: number;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromRaw(raw: any): BatchStatus {
        let bs = new BatchStatus();

        if (isTruthy(raw)) {
            bs.id = raw.id;
            bs.statusId = raw.statusId as ProcessingStatusEnum;
            bs.completePercent = raw.completePercent;
        }

        return bs;
    }
}
