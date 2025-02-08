import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { toArray } from '../../../../common/entities/gridAvailability';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { convertCanvasSize } from '../../../../common/helpers/map/common';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { MapService } from '../../../../input/services/mapService';
import { MapSettingModel } from '../../../entities/mapSettingModel';
import { currentSpot } from '../../../store/well';
import { getMapByParams } from '../gateways/gateway';
import { currentPlastId } from './currentPlastId';
import { historyDateState } from './historyDate';
import { modeMapTypeState } from './modeMapType';
import { selectedWellsState } from './selectedWells';

const mapSettingsRefresherState = atom({
    key: 'predictionMap__mapSettingsRefresherState',
    default: 0
});

export const mapSettingsRefresher = selector({
    key: 'predictionMap__mapSettingsRefresher',
    get: async ({ get }) => {
        return get(mapSettingsRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(mapSettingsRefresherState);

        set(mapSettingsRefresherState, previous + 1);
    }
});

const mapSettingsLoad = selector<MapSettingModel>({
    key: 'predictionResults__mapSettingsLoad',
    get: async ({ get }) => {
        const modeMapType = get(modeMapTypeState);
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);
        const historyDate = get(historyDateState);

        get(mapSettingsRefresher);

        const mapSettings = new MapSettingModel();

        const response = await getMapByParams(
            well,
            plastId,
            modeMapType === ModeMapEnum.Accumulated,
            historyDate,
            !isNullOrEmpty(selectedWells) ? map(it => it.id, selectedWells) : null
        );

        mapSettings.points = MapService.get(response.data.map);
        mapSettings.contour = response.data.contour;
        mapSettings.drilledFoundationPoints = MapService.getDrilledFoundation(response.data.drilledFoundation);
        mapSettings.mapHistoryRange = response.data.historyRange;
        mapSettings.canvasSize = convertCanvasSize(response.data.canvasSize);
        mapSettings.availableGrids = toArray<GridMapEnum>(response.data.availableGrids);
        mapSettings.flowInterwells = response.data.flowInterwells;
        mapSettings.accumulatedFlows = response.data.accumulatedFlows;
        mapSettings.inflowProfiles = response.data.inflowProfiles;
        mapSettings.compensations = response.data.compensations;
        mapSettings.tracerResearches = response.data.tracerResearches;
        mapSettings.krigingPeriod = response.data.krigingPeriod
            ? [new Date(response.data.krigingPeriod.startDate), new Date(response.data.krigingPeriod.endDate)]
            : null;
        mapSettings.pieScale = response.data.pieScale;

        return mapSettings;
    }
});

export const mapSettingsState = atom<MapSettingModel>({
    key: 'predictionResults__mapSettingsState',
    default: mapSettingsLoad
});

export const mapSettingsSelector = selector<MapSettingModel>({
    key: 'predictionResults__mapSettingsSelector',
    get: async ({ get }) => {
        return get(mapSettingsState);
    },
    set: ({ set }, newValue: MapSettingModel) => {
        set(mapSettingsState, newValue);
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'predictionResults__availableGridsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.availableGrids;
    },
    set: ({ get, set }, newValue: GridMapEnum[]) => {
        const mapSettings = get(mapSettingsState);

        set(mapSettingsState, shallow(mapSettings, { availableGrids: newValue }));
    }
});

export const krigingPeriodSelector = selector<Date[]>({
    key: 'predictionResults__krigingPeriodSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.krigingPeriod;
    }
});
