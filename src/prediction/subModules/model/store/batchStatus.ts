import { atom } from 'recoil';

import { BatchStatus } from '../../../../common/entities/batchStatus';

export const batchStatusState = atom<BatchStatus>({
    key: 'predictionModel__batchStatusState',
    default: null
});
