import { atom } from 'recoil';

import { localStorageEffect } from '../../common/helpers/recoil';

export const mapScaleState = atom<number>({
    key: 'common__mapScaleState',
    default: 1,
    effects: [localStorageEffect(`map_scale`)]
});
