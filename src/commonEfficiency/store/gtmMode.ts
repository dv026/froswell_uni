import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { atom } from 'recoil';

export const gtmModeState = atom<GtmTypeEnum>({
    key: 'efficiencyResults__gtmModeState',
    default: GtmTypeEnum.ByWell
});
