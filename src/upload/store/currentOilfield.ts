import { isNullOrEmpty } from 'common/helpers/ramda';
import { find, head, isNil } from 'ramda';
import { atom, selector } from 'recoil';

import { KeyValue } from '../../common/entities/keyValue';
import { oilFieldsSelector } from './oilFields';

const oilFieldState = atom<KeyValue>({
    key: 'upload__oilFieldState',
    default: null
});

export const selectedOilField = selector<KeyValue>({
    key: 'upload__selectedOilField',
    get: async ({ get }) => {
        const field = get(oilFieldState);

        if (field) {
            return field;
        }

        const list = get(oilFieldsSelector);

        return isNullOrEmpty(list) ? null : head(list);
    },
    set: ({ set }, newValue: KeyValue) => {
        set(oilFieldState, newValue);
    }
});

export const selectedOilFieldName = selector<KeyValue[]>({
    key: 'upload__selectedOilFieldName',
    get: async ({ get }) => {
        const field = get(selectedOilField);
        const fields = get(oilFieldsSelector);

        const item = find(it => it?.id === field?.id && !isNil(it.name), fields ?? []);

        if (isNil(item)) {
            return [];
        }

        return [item];
    }
});
