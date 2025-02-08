import { atom } from 'recoil';

import { CalculationSubScenariosModel } from '../../../../proxy/entities/proxyMap/calculationSubScenariosModel';

export const calculationSettingsState = atom<CalculationSubScenariosModel>({
    key: 'predictionModel__calculationSettingsState',
    default: new CalculationSubScenariosModel()
});
