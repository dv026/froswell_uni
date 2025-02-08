import { atom } from 'recoil';

import { CalculationModeEnum } from '../enums/calculationModeEnum';

export const calculationModeState = atom<CalculationModeEnum>({
    key: 'calculation__calculationModeState',
    default: CalculationModeEnum.Creation
});
