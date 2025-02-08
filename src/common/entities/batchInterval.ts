// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isTruthy } from '../helpers/ramda';
import { BatchStatus } from './batchStatus';

export class BatchInterval {
    private key: string;
    private status: BatchStatus;

    public id: number;

    // TODO: разобраться, какой должен быть тип - ComputationStatus или BatchStatus
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public constructor(action: (jobId: number) => void, key: string, lastStatus: any) {
        this.key = key;
        this.status = lastStatus;
        this.action = action;

        localStorage.setItem(key, JSON.stringify(lastStatus));
    }

    public action: (jobId: number) => void;

    // TODO: разобраться, какой должен быть тип - ComputationStatus или BatchStatus
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public update(lastStatus: any): void {
        if (BatchInterval.equal(this, lastStatus.id) && isTruthy(this.id)) {
            return;
        } else {
            this.stop();

            this.status = lastStatus;

            this.start();

            localStorage.setItem(this.key, JSON.stringify(lastStatus));
        }
    }

    public stop(): void {
        window.clearInterval(this.id);
        this.id = null;
        this.status = null;

        localStorage.removeItem(this.key);
    }

    public start(): void {
        if (this.status) {
            this.action(this.status.id);
            this.id = window.setInterval(() => {
                if (this.status) {
                    this.action(this.status.id);
                }
            }, 5000);
        }
    }

    public static restoreStatus(key: string): any {
        let item = localStorage.getItem(key);
        let result = null;
        if (item) {
            result = JSON.parse(item);
        }

        return result;
    }

    private static equal(batchInterval: BatchInterval, jobId: number): boolean {
        return batchInterval.status && batchInterval.status.id === jobId;
    }
}
