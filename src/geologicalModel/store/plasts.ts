import { isNullOrEmpty } from 'common/helpers/ramda';
import { selectedWellsState } from 'input/store/selectedWells';
import { atom, selector } from 'recoil';

import { PlastModel } from '../../common/entities/plastModel';
import { getPlasts } from '../../common/gateway';
import { currentSpot } from './well';

const plastList = selector<PlastModel[]>({
    key: 'geologicalModel__plastList',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const { data } = await getPlasts(isNullOrEmpty(selectedWells) ? [well] : selectedWells);

        return data;
    }
});

export const plastListState = atom<PlastModel[]>({
    key: 'geologicalModel__plastListState',
    default: plastList
});
