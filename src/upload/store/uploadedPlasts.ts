/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';
import { selector } from 'recoil';

import { UploadedPlast } from '../entities/uploadedPlast';
import { getUploadedPlasts } from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';

export const uploadedPlasts = selector<UploadedPlast[]>({
    key: 'upload__uploadedPlasts',
    get: async ({ get }) => {
        const oilField = get(selectedOilField);

        if (isNil(oilField)) {
            return;
        }

        const { data } = await getUploadedPlasts(oilField?.id);

        return data;
    }
});
