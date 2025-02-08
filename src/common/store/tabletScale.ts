import { atom } from 'recoil';

import { localStorageEffect } from '../../common/helpers/recoil';

export const tabletScaleState = atom<number>({
    key: 'common__tabletScaleState',
    default: 100,
    effects: [localStorageEffect(`tablet_scale`)]
});
