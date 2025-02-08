import { atom } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';

export const submoduleState = atom<SubModuleType>({
    key: 'prediction__submoduleState',
    default: SubModuleType.Calculation
});
