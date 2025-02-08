import { BatchInterval } from '../entities/batchInterval';
import { BatchStatus } from '../entities/batchStatus';
import { ProcessingStatusEnum } from '../entities/processingStatusEnum';

export const activateBatchCache = (
    hash: string,
    modelBatchStatus: BatchStatus,
    batchInterval: BatchInterval,
    pressAbort: boolean,
    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    action: any
): void => {
    const batchStatus = modelBatchStatus ? modelBatchStatus : (BatchInterval.restoreStatus(hash) as BatchStatus);

    if (
        !batchStatus ||
        (batchStatus.statusId !== ProcessingStatusEnum.InProgress &&
            batchStatus.statusId !== ProcessingStatusEnum.Pending)
    ) {
        // нет активного пакетного расчета: отменить пинг сервера - удалить интервал
        if (batchInterval) {
            batchInterval.stop();
        }

        return;
    }

    // необходим пинг сервера, так как выбрано либо месторождение, либо объект разработки
    if (!batchInterval) {
        batchInterval = new BatchInterval(action, hash, batchStatus);
        batchInterval.start(); // запустить проверку наличия пакетного расчета
    } else {
        // обновить уже существующий интервал
        if (!pressAbort) {
            batchInterval.update(batchStatus);
        }
    }
};
