import { atom } from 'recoil';

import { localStorageEffect } from '../../../common/helpers/recoil';
import { LoggingSettingModel } from '../../entities/loggingSettingModel';

export const loggingSettingsState = atom<LoggingSettingModel[]>({
    key: 'inputTablet__loggingSettingsState',
    default: [],
    effects: [localStorageEffect('logging_storage')]
});
