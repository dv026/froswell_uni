import { atom } from 'recoil';

import { SettingsModel } from '../entities/settingsModel';

export const settingsState = atom<SettingsModel>({
    key: 'optimizationTargets__settingsState',
    default: new SettingsModel()
});
