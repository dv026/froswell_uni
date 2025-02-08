import { atom } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';

export const selectedWellsState = atom<WellBrief[]>({
    key: 'calculation__selectedWellsState',
    default: []
});
