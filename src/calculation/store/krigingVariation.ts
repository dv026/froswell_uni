import { atom } from 'recoil';

import {
    initialKrigingVariationState,
    KrigingVariationState
} from '../../common/entities/kriging/krigingVariationState';

export const krigingVariationState = atom<KrigingVariationState>({
    key: 'calculationMap__krigingVariationState',
    default: initialKrigingVariationState
});
