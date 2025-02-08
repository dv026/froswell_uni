import {
    initialKrigingVariationLossesState,
    KrigingVariationLossesState
} from 'common/entities/kriging/krigingVariationLossesState';
import { VariationLossesModel } from 'common/entities/variationLossesModel';
import { filter } from 'ramda';
import { selector } from 'recoil';
import { atom } from 'recoil';

import { shallow } from '../../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../entities/krigingCalcSettings';
import { getMapVariationLosses } from '../../gateways';
import { currentPlastId } from '../plast';
import { currentSpot } from '../well';

export const krigingVariationLossesState = atom<KrigingVariationLossesState>({
    key: 'inputMap__krigingVariationLossesState',
    default: initialKrigingVariationLossesState
});

export const variationLossesSelector = selector<VariationLossesModel[]>({
    key: 'input__variationLossesSelector',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const settings = get(krigingVariationLossesState);
        const well = get(currentSpot);

        if (!settings.visible) {
            return [];
        }

        let model = new KrigingCalcSettingsModel();

        const response = await getMapVariationLosses(
            shallow(model, {
                oilFieldId: well.oilFieldId,
                productionObjectId: well.prodObjId,
                plastId: plastId,
                startDate: settings.startDate,
                endDate: settings.endDate
            })
        );

        return filter((it: VariationLossesModel) => it.plastId === plastId || !plastId, response?.data ?? []);
    }
});
