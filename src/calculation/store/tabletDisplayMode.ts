import { atom } from 'recoil';

import { DisplayModeEnum } from '../../common/enums/displayModeEnum';

export const tabletDisplayModeState = atom<DisplayModeEnum>({
    key: 'calculation__tabletDisplayModeState',
    default: DisplayModeEnum.TabletNew
});
