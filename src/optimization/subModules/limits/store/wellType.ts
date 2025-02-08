import { atom } from 'recoil';

import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';

export const wellTypeState = atom<WellTypeEnum>({
    key: 'optimizationLimits__wellTypeState',
    default: WellTypeEnum.Oil
});
