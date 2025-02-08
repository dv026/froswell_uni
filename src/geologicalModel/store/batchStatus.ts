import { atom } from 'recoil';

import { BatchStatus } from '../../common/entities/batchStatus';

export const batchStatusState = atom<BatchStatus>({
    key: 'geologicalModel__batchStatusState',
    default: null
});
