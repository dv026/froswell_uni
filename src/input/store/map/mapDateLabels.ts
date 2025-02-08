import { atom } from 'recoil';

import { WellDateLabel } from '../../../common/entities/mapCanvas/wellDateLabel';

export const mapDateLabels = atom<WellDateLabel[]>({
    key: 'inputMap__mapDateLabelsState',
    default: []
});
