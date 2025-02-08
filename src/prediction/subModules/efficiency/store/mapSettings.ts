import { currentPlastId } from 'calculation/store/currentPlastId';
import { toArray } from 'common/entities/gridAvailability';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { convertCanvasSize } from 'common/helpers/map/common';
import { isNullOrEmpty, shallow } from 'common/helpers/ramda';
import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { MapService } from 'input/services/mapService';
import { currentSpot } from 'prediction/store/well';
import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { gtmModeState } from '../../../../commonEfficiency/store/gtmMode';
import { historyDateState } from '../../../../commonEfficiency/store/historyDate';
import { modeMapTypeState } from '../../../../commonEfficiency/store/modeMapType';
import { selectedWellsState } from '../../../../commonEfficiency/store/selectedWells';
import { getMapByParams } from '../gateways/gateway';

const mapSettingsRefresherState = atom({
    key: 'predictionEfficiency__mapSettingsRefresherState',
    default: 0
});

export const mapSettingsRefresher = selector({
    key: 'predictionEfficiency__mapSettingsRefresher',
    get: async ({ get }) => {
        return get(mapSettingsRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(mapSettingsRefresherState);

        set(mapSettingsRefresherState, previous + 1);
    }
});

const mapSettingsLoad = selector<MapSettingModel>({
    key: 'predictionEfficiency__mapSettingsLoad',
    get: async ({ get }) => {
        const gtmType = get(gtmModeState);
        const historyDate = get(historyDateState);
        const mode = get(modeMapTypeState);
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        get(mapSettingsRefresher);

        const mapSettings = new MapSettingModel();

        const response = await getMapByParams(
            well,
            plastId,
            historyDate,
            !isNullOrEmpty(selectedWells) ? map(it => it.id, selectedWells) : null,
            EvaluationTypeEnum.Insim,
            gtmType,
            mode === ModeMapEnum.Accumulated
        );

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
    key: 'predictionEfficiency__mapSettingsState',
    default: mapSettingsLoad
});

export const mapSettingsSelector = selector<MapSettingModel>({
    key: 'predictionEfficiency__mapSettingsSelector',
    get: async ({ get }) => {
        return get(mapSettingsState);
    },
    set: ({ set }, newValue: MapSettingModel) => {
        set(mapSettingsState, newValue);
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'predictionEfficiency__availableGridsSelector',
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
    key: 'predictionEfficiency__krigingPeriodSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.krigingPeriod;
    }
});
