import { atom } from 'recoil';

import { DisplayModeEnum } from '../../../../common/enums/displayModeEnum';

export const displayModeState = atom<DisplayModeEnum>({
    key: 'proxyResults__displayModeState',
    default: DisplayModeEnum.Chart
});
