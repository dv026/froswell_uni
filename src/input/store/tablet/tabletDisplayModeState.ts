import { atom } from 'recoil';

import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';

export const tabletDisplayModeState = atom<DisplayModeEnum>({
    key: 'input__tabletDisplayModeState',
    default: DisplayModeEnum.TabletNew
});
