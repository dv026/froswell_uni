import { atom, selector } from 'recoil';

import { isNullOrEmpty } from '../../common/helpers/ramda';
import { selectedWellsState } from '../../input/store/selectedWells';
import { KalmanModel } from '../entities/wellDetailsModel';
import { calcKalman } from '../gateways';
import { kalmanParamsState } from './kalmanParams';
import { currentSpot } from './well';

const kalmanDataLoad = selector<KalmanModel[]>({
    key: 'filtration__kalmanDataLoad',
    get: async ({ get }) => {
        const params = get(kalmanParamsState);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const selected = isNullOrEmpty(selectedWells) ? [well] : selectedWells;

        if (isNullOrEmpty(selected)) {
            return null;
        }

        const { data } = await calcKalman(selected, params);

        return data;
    }
});

export const kalmanDataState = atom<KalmanModel[]>({
    key: 'filtration__kalmanDataState',
    default: kalmanDataLoad
});
