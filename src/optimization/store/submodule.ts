import { atom } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';

export const submoduleState = atom<SubModuleType>({
    key: 'optimization__submoduleState',
    default: SubModuleType.Calculation
});
