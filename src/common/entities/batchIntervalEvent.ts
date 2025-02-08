// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BatchInterval } from './batchInterval';
import { BatchStatus } from './batchStatus';
import { ProcessingStatusEnum } from './processingStatusEnum';

export class BatchIntervalEvent {
    private batchInterval: BatchInterval;
    private key: string;
    private batchStatus: BatchStatus;
    private action: any;
    private pressAbort: boolean;
    private pressForceAbort: boolean;

    public constructor() {
        this.pressAbort = false;
        this.pressForceAbort = false;
    }

    public activateBatchCache = (status: BatchStatus, key: string, action: any): void => {
        this.action = action;
        this.batchInterval = new BatchInterval(action, key, null);
        this.batchStatus = status ? status : (BatchInterval.restoreStatus(this.key) as BatchStatus);

        if (
            !this.batchStatus ||
            (this.batchStatus.statusId !== ProcessingStatusEnum.InProgress &&
                this.batchStatus.statusId !== ProcessingStatusEnum.Pending)
        ) {
            // нет активного пакетного расчета: отменить пинг сервера - удалить интервал
            if (this.batchInterval) {
                this.batchInterval.stop();
            }

            return;
        }

        // необходим пинг сервера, так как выбрано либо месторождение, либо объект разработки
        if (!this.batchInterval) {
            this.batchInterval = new BatchInterval(this.action, this.key, this.batchStatus);
            this.batchInterval.start(); // запустить проверку наличия пакетного расчета
        } else {
            // обновить уже существующий интервал
            if (!this.pressAbort && !this.pressForceAbort) {
                this.batchInterval.update(this.batchStatus);
            }
        }
    };

    public stop() {
        if (this.batchInterval) {
            this.batchInterval.stop();
        }

        this.pressAbort = false;
        this.pressForceAbort = false;
    }

    public abort() {
        this.pressAbort = true;
    }
}
