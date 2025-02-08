import { atom } from 'recoil';

import { BatchStatus } from '../../../../common/entities/batchStatus';

export const batchStatusState = atom<BatchStatus>({
    key: 'predictionMap__batchStatusState',
    default: null
});
