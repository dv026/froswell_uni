import { selector } from 'recoil';

import { GridMapSettings } from '../../common/entities/gridMapSettings';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { getMapGrid } from '../../input/gateways';
import { currentGridMap } from './gridMap';
import { mapIsolineSettings } from './mapIsolineSettings';
import { currentPlastId } from './plast';
import { currentSpot } from './well';

export const gridMapSettings = selector<GridMapSettings>({
    key: 'geologicalModel__gridMapSettings',
    get: async ({ get }) => {
        const gridMap = get(currentGridMap);

        if (gridMap === GridMapEnum.None) {
            return new GridMapSettings();
        }

        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        const response = await getMapGrid(gridMap, [well], plastId, null, isolineSettings);

        return GridMapSettings.fromRaw(response.data);
    }
});
