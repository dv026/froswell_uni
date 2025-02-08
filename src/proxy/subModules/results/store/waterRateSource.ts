import { WaterRateSourceRaw } from 'calculation/entities/waterRateSourceRaw';
import { currentPlastId } from 'calculation/store/currentPlastId';
import { map, split, takeLast } from 'ramda';
import { selector } from 'recoil';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { currentSpot } from '../../../store/well';
import { getWaterRateSource } from '../gateways/gateway';
import { selectedWellsState } from './selectedWells';
import { сurrentParamIdState } from './сurrentParamId';

export const waterRateSource = selector<WaterRateSourceRaw[]>({
    key: 'proxyResults__waterRateSource',
    get: async ({ get }) => {
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);
        const plast = get(currentPlastId);
        const currentParamId = get(сurrentParamIdState);

        let plastId = plast;

        if (currentParamId) {
            const params = takeLast(2, split('-', currentParamId));
            plastId = +params[1];
        }

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getWaterRateSource(well, currentWells, plastId);

        return response.data;
    }
});
