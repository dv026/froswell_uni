import { atom } from 'recoil';

import { ReportExportModel } from '../entities/exportModel';

export const exportModelState = atom<ReportExportModel>({
    key: 'predictionResults__exportModelState',
    default: null
});
