import { isNullOrEmpty } from 'common/helpers/ramda';
import { distributionTypeState } from 'input/store/map/distributionType';
import { selectedWellsState } from 'input/store/selectedWells';
import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { toArray } from '../../common/entities/gridAvailability';
import { KeyValue } from '../../common/entities/keyValue';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { convertCanvasSize } from '../../common/helpers/map/common';
import { getMapByParams } from '../../input/gateways';
import { MapService } from '../../input/services/mapService';
import { MapSettingModel } from '../entities/mapSettingModel';
import { dataTypeState } from './dataType';
import { historyDateState } from './historyDate';
import { currentPlastId } from './plast';
import { currentSpot } from './well';

export const mapSettingsState = selector<MapSettingModel>({
    key: 'geologicalModel__mapSettingsLoad',
    get: async ({ get }) => {
        const dataType = get(dataTypeState);
        const historyDate = get(historyDateState);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);
        const distributionType = get(distributionTypeState);
        const selectedWells = get(selectedWellsState);

        const mapSettings = new MapSettingModel(); // todo mb

        //const { data: plasts } = await getPlasts(well.prodObjId);

        const { data } = await getMapByParams(
            isNullOrEmpty(selectedWells) ? [well] : selectedWells,
            plastId,
            mapSettings.radius,
            dataType,
            distributionType,
            historyDate
        );

        mapSettings.points = MapService.get(data.map);
        mapSettings.fullPoints = MapService.getFull(data.map);
        mapSettings.drilledFoundationPoints = MapService.getDrilledFoundation(data.drilledFoundation);
        mapSettings.contour = data.contour;
        mapSettings.mapHistoryRange = data.historyRange;
        mapSettings.canvasSize = convertCanvasSize(data.canvasSize);
        mapSettings.plastDict = map(x => new KeyValue(x.id, x.name), data.plasts);
        mapSettings.availableGrids = toArray<GridMapEnum>(data.availableGrids);

        return mapSettings;
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'geologicalModel__availableGridsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.availableGrids;
    }
});
