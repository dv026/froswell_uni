import { selector } from 'recoil';

import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { currentGridMap } from '../../../calculation/store/gridMap';
import { mapIsolineSettings } from '../../../calculation/store/mapIsolineSettings';
import { GridMapSettings } from '../../../common/entities/gridMapSettings';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { addMonth } from '../../../common/helpers/date';
import { refresher } from '../../../common/helpers/recoil';
import { getMapGrid } from '../../../input/gateways';
import { currentSpot } from '../well';
import { maxMerDateSelector } from './mapSettings';

export const refresherGridMap = refresher('proxyMap', 'gridMap');

export const gridMapSettings = selector<GridMapSettings>({
    key: 'proxyMap__gridMapSettings',
    get: async ({ get }) => {
        const gridMap = get(currentGridMap);

        if (gridMap === GridMapEnum.None) {
            return new GridMapSettings();
        }

        get(refresherGridMap);

        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        let date = null;

        if (
            gridMap === GridMapEnum.Pressure ||
            gridMap === GridMapEnum.VolumeWaterCut ||
            gridMap === GridMapEnum.CurrentOilSaturatedThickness ||
            gridMap === GridMapEnum.CurrentKH ||
            gridMap === GridMapEnum.SkinFactor
        ) {
            const maxMerDate = get(maxMerDateSelector);

            date = addMonth(maxMerDate, -1);
        }

        const response = await getMapGrid(gridMap, [well], plastId, date, isolineSettings);

        return GridMapSettings.fromRaw(response.data);
    }
});
