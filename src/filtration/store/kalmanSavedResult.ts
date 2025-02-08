import { head } from 'ramda';
import { atom, selector } from 'recoil';

import { isNullOrEmpty } from '../../common/helpers/ramda';
import { selectedWellsState } from '../../input/store/selectedWells';
import { KalmanSavedResult } from '../entities/wellDetailsModel';
import { getSavedResult } from '../gateways';
import { currentSpot } from './well';

const kalmanSavedResultLoad = selector<KalmanSavedResult[]>({
    key: 'filtration__kalmanSavedResultLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const selected = isNullOrEmpty(selectedWells) ? [well] : selectedWells;

        if (isNullOrEmpty(selected)) {
            return null;
        }

        if (!isNullOrEmpty(selected) && !head(selected).id) {
            return null;
        }

        const { data } = await getSavedResult(selected);

        return data;
    }
});

export const kalmanSavedResultState = atom<KalmanSavedResult[]>({
    key: 'filtration__kalmanSavedResultState',
    default: kalmanSavedResultLoad
});
