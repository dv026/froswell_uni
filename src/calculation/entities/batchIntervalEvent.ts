// TODO: типизация
import { BatchInterval } from '../../common/entities/batchInterval';
import { ComputationStatus, isFinished, isInProgress } from './computation/computationStatus';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export class BatchIntervalEvent {
    private batchInterval: BatchInterval;
    private key: string;
    private batchStatus: ComputationStatus;
    private action: any;
    private pressAbort: boolean;
    private pressForceAbort: boolean;

    public constructor() {
        this.pressAbort = false;
        this.pressForceAbort = false;
    }

    public activateBatchCache = (status: ComputationStatus, key: string, action: any): void => {
        // был создан новый расчет, но интервал для его проверки еще не существует
        // => создать новый интервал и запустить его
        if (!!status && !isFinished(status) && !this.batchInterval) {
            this.batchInterval = new BatchInterval(action, key, status);
            this.batchInterval.start();

            return;
        }

        // расчет существует, и для его проверки уже создан интервал
        if (!!status && !!this.batchInterval) {
            if (isInProgress(status)) {
                // расчет активен - обновить интервал последними значениями
                this.batchInterval.update(status);
            }

            if (isFinished(status)) {
                // расчет уже завершен - удалить интервал для его проверки
                this.batchInterval.stop();
                this.batchInterval = null;
                // actions.updateObjectPreparation();
            }

            return;
        }

        // расчет уже/еще не существует - удостовериться, что нет активного интервала. Если он есть - удалить
        if (!status && !!this.batchInterval) {
            this.batchInterval.stop();
            this.batchInterval = null;
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
