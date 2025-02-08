import { atom } from 'recoil';

import { SubModuleType } from '../../calculation/enums/subModuleType';

export const submoduleState = atom<SubModuleType>({
    key: 'proxy__submoduleState',
    default: SubModuleType.Calculation
});
