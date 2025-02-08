import { WellBrief } from 'common/entities/wellBrief';
import { atom } from 'recoil';

export const selectedWellsState = atom<WellBrief[]>({
    key: 'efficiencyResults__selectedWellsState',
    default: []
});
