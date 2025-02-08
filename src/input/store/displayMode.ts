import { atom } from 'recoil';

import { DisplayModeEnum } from '../../common/enums/displayModeEnum';

export const displayModeState = atom<DisplayModeEnum>({
    key: 'input__displayModeState',
    default: DisplayModeEnum.Chart
});
