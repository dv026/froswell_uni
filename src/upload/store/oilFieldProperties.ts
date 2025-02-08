/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';
import { selector } from 'recoil';

import { OilFieldProperties } from '../entities/oilFieldProperties';
import { getOilFieldProperties } from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';

export const oilFieldPropertiesSelector = selector<OilFieldProperties>({
    key: 'upload__oilFieldPropertiesSelector',
    get: async ({ get }) => {
        const oilField = get(selectedOilField);

        if (isNil(oilField)) {
            return;
        }

        const { data } = await getOilFieldProperties(oilField?.id);

        return data;
    }
});
