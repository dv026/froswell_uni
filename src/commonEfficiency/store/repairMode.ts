import { atom } from 'recoil';

export const repairModeState = atom<number>({
    key: 'efficiencyResults__repairModeState',
    default: 0
});
