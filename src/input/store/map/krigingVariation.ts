import { atom } from 'recoil';

import {
    initialKrigingVariationState,
    KrigingVariationState
} from '../../../common/entities/kriging/krigingVariationState';

export const krigingVariationState = atom<KrigingVariationState>({
    key: 'inputMap__krigingVariationState',
    default: initialKrigingVariationState
});
