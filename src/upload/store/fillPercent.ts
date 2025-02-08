/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';
import { selector } from 'recoil';

import { UploadFillPercent } from '../entities/uploadFillPercent';
import { getUploadedFillPercent } from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';

export const fillPercentSelector = selector<UploadFillPercent>({
    key: 'upload__fillPercentSelector',
    get: async ({ get }) => {
        const oilField = get(selectedOilField);

        if (isNil(oilField)) {
            return;
        }

        const { data } = await getUploadedFillPercent(oilField?.id);

        return data;
    }
});
