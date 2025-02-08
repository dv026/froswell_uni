import { atom } from 'recoil';

import { WellGridBatchStatus } from '../../../entities/proxyMap/wellGridBatchStatus';

export const batchStatusState = atom<WellGridBatchStatus>({
    key: 'proxyModel__batchStatusState',
    default: null
});
