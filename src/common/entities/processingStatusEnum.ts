import * as R from 'ramda';

import { isTruthy } from '../../common/helpers/ramda';

export enum ProcessingStatusEnum {
    Pending = 1,
    InProgress = 2,
    Finished = 3,
    FinishedWithErrors = 4,
    Aborted = 5
}

export const processingFinished = (x: ProcessingStatusEnum): boolean =>
    isTruthy(x) &&
    (x === ProcessingStatusEnum.Finished ||
        x === ProcessingStatusEnum.FinishedWithErrors ||
        x === ProcessingStatusEnum.Aborted);

export const processingInProgress = (x: ProcessingStatusEnum): boolean =>
    isTruthy(x) && (x === ProcessingStatusEnum.Pending || x === ProcessingStatusEnum.InProgress);

export const processingNotFinishedCorrectly = (x: ProcessingStatusEnum): boolean =>
    R.anyPass([R.equals(ProcessingStatusEnum.FinishedWithErrors), R.equals(ProcessingStatusEnum.Aborted)])(x);
