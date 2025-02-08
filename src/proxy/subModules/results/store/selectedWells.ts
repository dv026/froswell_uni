import { KeyValue } from 'common/entities/keyValue';
import { wellListForResults, wellListState } from 'proxy/store/wellList';
import { find, map } from 'ramda';
import { atom, selector } from 'recoil';

import { WellBrief } from '../../../../common/entities/wellBrief';

export const selectedWellsState = atom<WellBrief[]>({
    key: 'proxyResults__selectedWellsState',
    default: []
});

export const selectedWellNamesSelector = selector<KeyValue[]>({
    key: 'proxyResults__selectedWellNamesSelector',
    get: ({ get }) => {
        const wells = get(wellListForResults);
        const selectedWells = get(selectedWellsState);

        const result = map(it => {
            const item = find(
                x => it.eqTo(new WellBrief(x.oilFieldId, x.id, x.productionObjectId, x.charWorkId, x.scenarioId)),
                wells
            );

            return new KeyValue(it.id, item?.name);
        }, selectedWells);

        return result;
    }
});
