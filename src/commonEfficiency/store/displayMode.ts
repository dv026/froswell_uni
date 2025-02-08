import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { atom } from 'recoil';

export const displayModeState = atom<DisplayModeEnum>({
    key: 'commonEfficiency__displayModeState',
    default: DisplayModeEnum.Chart
});
