import { atom } from 'recoil';

import { GroupType } from '../enums/groupType';

export const groupTypeState = atom<GroupType>({
    key: 'optimizationLimits__groupTypeState',
    default: GroupType.WaterCut
});
