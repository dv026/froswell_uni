import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { toArray } from '../../../../common/entities/gridAvailability';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { convertCanvasSize } from '../../../../common/helpers/map/common';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { MapService } from '../../../../input/services/mapService';
import { currentSpot } from '../../../store/well';
import { MapSettingModel } from '../entities/mapSettingModel';
import { requestOnlyMap } from '../gateways/gateway';
import { historyDateState } from './historyDate';
import { modeMapTypeState } from './modeMapType';
import { selectedWellsState } from './selectedWells';

const mapSettingsLoad = selector<MapSettingModel>({
    key: 'optimizationResults__mapSettingsLoad',
    get: async ({ get }) => {
        const modeMapType = get(modeMapTypeState);
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);
        const historyDate = get(historyDateState);

        const { data: mapResponse } = await requestOnlyMap(
            well,
            plastId,
            historyDate,
            modeMapType === ModeMapEnum.Accumulated,
            !isNullOrEmpty(selectedWells) ? map(it => it.id, selectedWells) : null
        );

        const mapSettings = new MapSettingModel();

        mapSettings.points = MapService.get(mapResponse.map); // todo mb
        mapSettings.contour = mapResponse.contour;
        mapSettings.drilledFoundationPoints = MapService.getDrilledFoundation(mapResponse.drilledFoundation);
        mapSettings.mapHistoryRange = mapResponse.historyRange;
        mapSettings.canvasSize = convertCanvasSize(mapResponse.canvasSize);
        mapSettings.availableGrids = toArray<GridMapEnum>(mapResponse.availableGrids);
        mapSettings.flowInterwells = mapResponse.flowInterwells;
        mapSettings.accumulatedFlows = mapResponse.accumulatedFlows;
        mapSettings.inflowProfiles = mapResponse.inflowProfiles;
        mapSettings.compensations = mapResponse.compensations;
        mapSettings.tracerResearches = mapResponse.tracerResearches;
        mapSettings.krigingPeriod = mapResponse.krigingPeriod
            ? [new Date(mapResponse.krigingPeriod.startDate), new Date(mapResponse.krigingPeriod.endDate)]
            : null;
        mapSettings.pieScale = mapResponse.pieScale;

        return mapSettings;
    }
});

export const mapSettingsState = atom<MapSettingModel>({
    key: 'optimizationResults__mapSettingsState',
    default: mapSettingsLoad
});

export const mapSettingsSelector = selector<MapSettingModel>({
    key: 'optimizationResults__mapSettingsSelector',
    get: async ({ get }) => {
        return get(mapSettingsState);
    },
    set: ({ set }, newValue: MapSettingModel) => {
        set(mapSettingsState, newValue);
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'optimizationResults__availableGridsSelector',
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
    key: 'optimizationResults__krigingPeriodSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.krigingPeriod;
    }
});
