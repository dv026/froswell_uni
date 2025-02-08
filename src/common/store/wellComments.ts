import { WellCommentModel } from 'common/entities/mapCanvas/wellCommentModel';
import { getWellComments } from 'common/gateway';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { selectedWellsState } from 'input/store/selectedWells';
import { currentSpot } from 'input/store/well';
import { selector } from 'recoil';

export const wellCommentsSelector = selector<WellCommentModel[]>({
    key: 'common__wellCommentsSelector',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const response = await getWellComments(isNullOrEmpty(selectedWells) ? [well] : selectedWells, null);

        return response.data;
    }
});
