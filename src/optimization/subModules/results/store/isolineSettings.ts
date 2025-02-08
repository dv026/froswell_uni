import { atom } from 'recoil';

import { IsolineModel } from '../../../../common/entities/mapCanvas/isolineModel';

export const isolineSettingsState = atom<IsolineModel>({
    key: 'optimizationResults__isolineSettingsState',
    default: null
});
