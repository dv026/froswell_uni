import { toArray } from 'common/entities/gridAvailability';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { convertCanvasSize } from 'common/helpers/map/common';
import { shallow } from 'common/helpers/ramda';
import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { MapService } from 'input/services/mapService';
import { currentPlastId } from 'input/store/plast';
import { currentSpot } from 'input/store/well';
import { atom, selector } from 'recoil';

import { gtmModeState } from '../../commonEfficiency/store/gtmMode';
import { historyDateState } from '../../commonEfficiency/store/historyDate';
import { modeMapTypeState } from '../../commonEfficiency/store/modeMapType';
import { getMapByParams } from '../gateways/gateway';

const mapSettingsRefresherState = atom({
    key: 'inputEfficiency__mapSettingsRefresherState',
    default: 0
});

export const mapSettingsRefresher = selector({
    key: 'inputEfficiency__mapSettingsRefresher',
    get: async ({ get }) => {
        return get(mapSettingsRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(mapSettingsRefresherState);

        set(mapSettingsRefresherState, previous + 1);
    }
});

const mapSettingsLoad = selector<MapSettingModel>({
    key: 'inputEfficiency__mapSettingsLoad',
    get: async ({ get }) => {
        const gtmType = get(gtmModeState);
        const historyDate = get(historyDateState);
        const mode = get(modeMapTypeState);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        get(mapSettingsRefresher);

        const mapSettings = new MapSettingModel();

        const response = await getMapByParams(well, plastId, historyDate, gtmType, mode === ModeMapEnum.Accumulated);

        mapSettings.points = MapService.get(response.data.map);
        mapSettings.contour = response.data.contour;
        mapSettings.mapHistoryRange = response.data.historyRange;
        mapSettings.canvasSize = convertCanvasSize(response.data.canvasSize);
        mapSettings.availableGrids = toArray<GridMapEnum>(response.data.availableGrids);
        mapSettings.operationDistribution = response.data.operationDistribution;

        return mapSettings;
    }
});

export const mapSettingsState = atom<MapSettingModel>({
    key: 'inputEfficiency__mapSettingsState',
    default: mapSettingsLoad
});

export const mapSettingsSelector = selector<MapSettingModel>({
    key: 'inputEfficiency__mapSettingsSelector',
    get: async ({ get }) => {
        return get(mapSettingsState);
    },
    set: ({ set }, newValue: MapSettingModel) => {
        set(mapSettingsState, newValue);
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'inputEfficiency__availableGridsSelector',
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
    key: 'inputEfficiency__krigingPeriodSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.krigingPeriod;
    }
});
