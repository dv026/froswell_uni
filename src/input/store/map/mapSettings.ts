import { isNullOrEmpty } from 'common/helpers/ramda';
import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { toArray } from '../../../common/entities/gridAvailability';
import { KeyValue } from '../../../common/entities/keyValue';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { convertCanvasSize } from '../../../common/helpers/map/common';
import { MapSettingModel } from '../../entities/mapSettingModel';
import { getMapByParams } from '../../gateways';
import { MapService } from '../../services/mapService';
import { dataTypeState } from '../dataType';
import { currentPlastId } from '../plast';
import { selectedWellsState } from '../selectedWells';
import { currentSpot } from '../well';
import { appearanceSettingsState, showNaturalRadiusSelector } from './appearanceSettings';
import { distributionTypeState } from './distributionType';

const mapSettingsLoad = selector<MapSettingModel>({
    key: 'input__mapSettingsLoad',
    get: async ({ get }) => {
        const dataType = get(dataTypeState);
        const distribution = get(distributionTypeState);
        const plastId = get(currentPlastId);
        const showNaturalRadius = get(showNaturalRadiusSelector);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const mapSettings = new MapSettingModel(); // todo mb

        const { data } = await getMapByParams(
            isNullOrEmpty(selectedWells) ? [well] : selectedWells,
            plastId,
            mapSettings.radius,
            dataType,
            distribution,
            null,
            showNaturalRadius
        );

        mapSettings.availableGrids = toArray<GridMapEnum>(data.availableGrids);
        mapSettings.canvasSize = convertCanvasSize(data.canvasSize);
        mapSettings.contour = data.contour;
        mapSettings.drilledFoundationPoints = MapService.getDrilledFoundation(data.drilledFoundation);
        mapSettings.mapHistoryRange = data.historyRange;
        mapSettings.plastDict = map(x => new KeyValue(x.id, x.name), data.plasts);
        mapSettings.points = MapService.get(data.map);
        mapSettings.fullPoints = MapService.getFull(data.map);
        mapSettings.tracerResearches = data.tracerResearches;
        mapSettings.krigingPeriod = data.krigingPeriod
            ? [new Date(data.krigingPeriod.startDate), new Date(data.krigingPeriod.endDate)]
            : null;
        mapSettings.pieScale = data.pieScale;
        mapSettings.wellComments = data.wellComments;

        return mapSettings;
    }
});

export const mapSettingsState = atom<MapSettingModel>({
    key: 'input__mapSettingsState',
    default: mapSettingsLoad
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'input__availableGridsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.availableGrids;
    }
});
