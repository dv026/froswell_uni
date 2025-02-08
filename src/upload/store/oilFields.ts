/* eslint-disable @typescript-eslint/no-explicit-any */
import { selector } from 'recoil';

import { KeyValue } from '../../common/entities/keyValue';
import { getOilFields } from '../gateways/gateway';

export const oilFieldsSelector = selector<KeyValue[]>({
    key: 'upload__oilFieldsSelector',
    get: async () => {
        const { data } = await getOilFields();

        return data;
    }
});
