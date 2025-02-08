import { filter, find, flatten, forEach, pipe } from 'ramda';
import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { toArray } from '../../../common/entities/gridAvailability';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { dateWithoutZone } from '../../../common/helpers/date';
import { convertCanvasSize } from '../../../common/helpers/map/common';
import { isNullOrEmpty, shallow } from '../../../common/helpers/ramda';
import { MapSettingModel } from '../../entities/proxyMap/mapSettingModel';
import { WellPoint } from '../../entities/proxyMap/wellPoint';
import { getMap } from '../../gateways/wellGrid/gateway';
import { getImaginaryWells, getIntermediateImaginaryWells, getRaw } from '../../services/mapService';
import { currentSpot } from '../well';

const mapSettingsRefresherState = atom({
    key: 'proxyMap__mapSettingsRefresherState',
    default: 0
});

export const mapSettingsRefresher = selector({
    key: 'proxyMap__mapSettingsRefresher',
    get: async ({ get }) => {
        return get(mapSettingsRefresherState);
    },
    set: ({ get, set }) => {
        const previous = get(mapSettingsRefresherState);

        set(mapSettingsRefresherState, previous + 1);
    }
});

export const mapSettingsLoader = selector<MapSettingModel>({
    key: 'proxyMap__mapSettingsLoader',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        get(mapSettingsRefresher);

        const mapSettings = new MapSettingModel();

        const response = await getMap(well, plastId);

        const result = getRaw(response.data.map);

        mapSettings.points = pipe(
            filter(onlyActiveRealWells),
            injectImaginaryCharworks(getRaw(response.data.realWellsWithImaginary))
        )(result);

        mapSettings.intermediatePoints = getIntermediateImaginaryWells(response.data.intermediateImaginaryWells);
        mapSettings.includeIntermediateWells = !isNullOrEmpty(mapSettings.intermediatePoints);
        mapSettings.drilledPoints = filter(it => it.isDrilledFoundation && it.isEmptyTypeHistory, result);
        mapSettings.availableGrids = toArray<GridMapEnum>(response.data.availableGrids);

        mapSettings.maxMerDate = dateWithoutZone(new Date(response.data.maxMerDate));

        mapSettings.originalCurrentFundWithImaginary = getRaw(response.data.realWellsWithImaginary);
        mapSettings.currentFundWithImaginary = mapSettings.originalCurrentFundWithImaginary;

        mapSettings.originalImaginaryPoints = getImaginaryWells(response.data.imaginaryWells);
        mapSettings.imaginaryPoints = mapSettings.originalImaginaryPoints;

        mapSettings.contour = response.data.contour;
        mapSettings.canvasSize = convertCanvasSize(response.data.canvasSize);

        mapSettings.efficiencyCountSteps = response.data.efficiencyCountSteps;
        mapSettings.interwellConnections = response.data.interwells;

        mapSettings.maxWellId = response.data.maxWellId;

        mapSettings.aquifers = response.data.aquifers;

        mapSettings.wellGroup = response.data.wellGroup;

        return mapSettings;
    }
});

export const mapSettingsState = atom<MapSettingModel>({
    key: 'proxyMap__mapSettingsState',
    default: mapSettingsLoader
});

export const concatedPointsSelector = selector<WellPoint[]>({
    key: 'proxyMap__concatedPointsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return (
            flatten([
                mapSettings.points,
                mapSettings.imaginaryPoints,
                mapSettings.intermediatePoints,
                mapSettings.drilledPoints
            ]) ?? []
        );
    }
});

export const availableGridsSelector = selector<GridMapEnum[]>({
    key: 'proxyMap__availableGridsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.availableGrids;
    },
    set: ({ get, set }, newValue: GridMapEnum[]) => {
        const mapSettings = get(mapSettingsState);

        set(mapSettingsState, shallow(mapSettings, { availableGrids: newValue }));
    }
});

export const maxMerDateSelector = selector<Date>({
    key: 'proxyMap__maxMerDateSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        return mapSettings?.maxMerDate;
    }
});

// TODO: определить типизацию для realWithImaginaryCharworks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const injectImaginaryCharworks = (realWithImaginaryCharworks: any[]) => (points: WellPoint[]) => {
    if (isNullOrEmpty(realWithImaginaryCharworks)) {
        return points;
    }

    return forEach(point => {
        const icw = find(x => x.id === point.id, realWithImaginaryCharworks);

        if (isNullOrEmpty(icw?.typeHistory)) {
            return point;
        }

        point.typeHistory = icw.typeHistory;

        return point;
    }, points);
};

const onlyActiveRealWells = it => !it.isImaginary && !it.isIntermediate && !it.isDrilledFoundation;
