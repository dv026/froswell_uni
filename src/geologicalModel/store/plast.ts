import { any, head } from 'ramda';
import { atom, selector } from 'recoil';

import { mapSettingsState } from './mapSettings';
import { plastListState } from './plasts';

const defaultPlast = selector<number>({
    key: 'geologicalModel__defaultPlast',
    get: async ({ get }) => {
        const plasts = get(plastListState);

        return head(plasts)?.id;
    }
});

const plastState = atom<number>({
    key: 'geologicalModel__plastState',
    default: defaultPlast
});

export const currentPlastId = selector<number>({
    key: 'geologicalModel__currentPlastId',
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
        set(plastState, value);
    }
});
