import { atom } from 'recoil';

import { TabletModeType } from '../../enums/tabletModeType';

export const tabletModeTypeState = atom<TabletModeType>({
    key: 'input__tabletModeTypeState',
    default: TabletModeType.Plasts
});
