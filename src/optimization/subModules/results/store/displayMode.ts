import { atom } from 'recoil';

import { DisplayModeEnum } from '../../../../common/enums/displayModeEnum';

export const displayModeState = atom<DisplayModeEnum>({
    key: 'optimizationResults__displayModeState',
    default: DisplayModeEnum.Chart
});
