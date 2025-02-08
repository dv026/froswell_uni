/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';
import { selector } from 'recoil';

import { UploadedPlast } from '../entities/uploadedPlast';
import { getUploadedWells } from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';

export const uploadedWells = selector<UploadedPlast[]>({
    key: 'upload__uploadedWells',
    get: async ({ get }) => {
        const oilField = get(selectedOilField);

        if (isNil(oilField)) {
            return;
        }

        const { data } = await getUploadedWells(oilField?.id);

        return data;
    }
});
