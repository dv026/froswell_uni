import { any } from 'ramda';
import { atom, selector } from 'recoil';

import { historyDateState } from './map/historyDate';
import { mapSettingsState } from './map/mapSettings';
import { plastListState } from './plasts';

const plastState = atom<number>({
    key: 'input__plastState',
    default: null
});

export const currentPlastId = selector<number>({
    key: 'input__currentPlastId',
    get: async ({ get }) => {
        const plasts = get(plastListState);

        let plastId = get(plastState);

        // если у новой скважины есть пласт текущей скважины, установить его текущим
        // если нет, то оставить значение по умолчанию (по объекту)
        if (!any(x => x.id === plastId, plasts || [])) {
            plastId = null;
        }

        return plastId;
    },
    set: ({ set, reset }, value: number) => {
        reset(historyDateState);
        reset(mapSettingsState);

        set(plastState, value);
    }
});
