import { atom, selector } from 'recoil';

import { isNullOrEmpty } from '../../common/helpers/ramda';
import { oilFieldPropertiesSelector } from './oilFieldProperties';

const plastState = atom<number>({
    key: 'upload__plastState',
    default: null
});

export const currentPlastSelector = selector<number>({
    key: 'upload__currentPlastSelector',
    get: async ({ get }) => {
        const plast = get(plastState);

        if (plast) {
            return plast;
        }

        const props = get(oilFieldPropertiesSelector);

        return isNullOrEmpty(props.plasts) ? null : props.plasts[0].id;
    },
    set: ({ set }, value: number) => {
        set(plastState, value);
    }
});
