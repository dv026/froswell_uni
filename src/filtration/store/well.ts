import { atom, selector } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';
import { WellModel } from '../../common/entities/wellModel';
import { findOrDefault } from '../../common/helpers/ramda';
import { showSavedResultState } from './showSavedResult';
import { wellListState } from './wells';

const firstObjectFromList = (list: WellModel[]): WellBrief =>
    findOrDefault(
        x => !!x.productionObjectId,
        x => new WellBrief(x.oilFieldId, null, x.productionObjectId),
        null,
        list
    );

const wellState = atom<WellBrief>({
    key: 'filtration__wellState',
    default: null
});

export const currentSpot = selector<WellBrief>({
    key: 'filtration__currentSpot',
    get: async ({ get }) => {
        const well = get(wellState);

        if (well) {
            return well;
        }

        // попробовать найти первую скважину в списке
        const list = get(wellListState);

        return firstObjectFromList(list);
    },
    set: ({ set, reset }, value: WellBrief) => {
        set(wellState, value);

        reset(showSavedResultState);
    }
});
