import { isNil } from 'ramda';
import { selector } from 'recoil';

import { UploadedBrand } from '../entities/uploadedBrand';
import { getUploadedAvailableTools } from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';
import { currentPlastSelector } from './currentPlast';

export const uploadedAvailableTools = selector<UploadedBrand[]>({
    key: 'upload__uploadedAvailableTools',
    get: async ({ get }) => {
        const oilField = get(selectedOilField);
        const plast = get(currentPlastSelector);

        if (isNil(oilField)) {
            return;
        }

        const { data } = await getUploadedAvailableTools(oilField?.id, plast);

        return data;
    }
});
