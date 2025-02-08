import { isNullOrEmpty } from 'common/helpers/ramda';
import { find, map } from 'ramda';
import { atom, selector } from 'recoil';

import { KeyValue } from '../../common/entities/keyValue';
import { WellBrief } from '../../common/entities/wellBrief';
import { wellListState } from './wells';

export const selectedWellsState = atom<WellBrief[]>({
    key: 'input__selectedWellsState',
    default: []
});

export const selectedWellNamesSelector = selector<KeyValue[]>({
    key: 'input__selectedWellNamesSelector',
    get: ({ get }) => {
        const wells = get(wellListState);
        const selectedWells = get(selectedWellsState);

        const result = map(it => {
            const item = find(
                x =>
                    (x.oilFieldId === it.oilFieldId || !it.oilFieldId) &&
                    (x.productionObjectId === it.prodObjId || !it.prodObjId) &&
                    (x.id === it.id || !it.id),
                wells
            );

            return new KeyValue(
                it.id,
                [it.id && item?.name, it.prodObjId && item?.productionObjectName, it.oilFieldId && item?.oilFieldName]
                    .filter(it => !isNullOrEmpty(it))
                    .join(', ')
            );
        }, selectedWells);

        return result;
    }
});
