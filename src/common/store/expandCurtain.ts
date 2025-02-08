import { atomFamily } from 'recoil';

import { localStorageEffect } from '../../common/helpers/recoil';

export const expandCurtainState = atomFamily({
    key: 'common__expandCurtainState',
    default: true,
    effects: parameter => [localStorageEffect(`curtain_expand_${parameter.toString()}`)]
});
