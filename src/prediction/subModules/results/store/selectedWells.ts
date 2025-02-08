import { KeyValue } from 'common/entities/keyValue';
import { wellListForResults, wellListState } from 'prediction/store/wellList';
import { find, map } from 'ramda';
import { atom, selector } from 'recoil';

import { WellBrief } from '../../../../common/entities/wellBrief';

export const selectedWellsState = atom<WellBrief[]>({
    key: 'predictionResults__selectedWellsState',
    default: []
});

export const selectedWellNamesSelector = selector<KeyValue[]>({
    key: 'predictionResults__selectedWellNamesSelector',
    get: ({ get }) => {
        const wells = get(wellListForResults);
        const selectedWells = get(selectedWellsState);

        const result = map(it => {
            const item = find(
                x =>
                    it.eqTo(
                        new WellBrief(
                            x.oilFieldId,
                            x.id,
                            x.productionObjectId,
                            x.charWorkId,
                            x.scenarioId,
                            x.subScenarioId
                        )
                    ),
                wells
            );

            return new KeyValue(it.id, item?.name);
        }, selectedWells);

        return result;
    }
});
