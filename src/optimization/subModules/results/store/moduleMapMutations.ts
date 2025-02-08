import { map } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { currentGridMap } from '../../../../calculation/store/gridMap';
import { toArray } from '../../../../common/entities/gridAvailability';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { downloadFile } from '../../../../common/helpers/file';
import { convertCanvasSize } from '../../../../common/helpers/map/common';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { getExportMapGrid } from '../../../../input/gateways';
import { MapService } from '../../../../input/services/mapService';
import { currentPlastId } from '../../../../prediction/subModules/results/store/currentPlastId';
import { currentSpot } from '../../../store/well';
import { MapSettingModel } from '../entities/mapSettingModel';
import { requestOnlyMap } from '../gateways/gateway';
import { historyDateState } from './historyDate';
import { mapSettingsState } from './mapSettings';
import { modeMapTypeState } from './modeMapType';
import { selectedWellsState } from './selectedWells';

export const isLoadingState = atom<boolean>({
    key: 'optimizationMap__isLoadingState',
    default: false
});

export function useModuleMapMutations() {
    const reload = useRecoilCallback(({ snapshot, set }) => async (historyDate: Date) => {
        const plastId = await snapshot.getPromise(currentPlastId);
        const selectedWells = await snapshot.getPromise(selectedWellsState);
        const well = await snapshot.getPromise(currentSpot);
        const modeMapType = await snapshot.getPromise(modeMapTypeState);

        set(isLoadingState, true);

        set(historyDateState, historyDate);

        const mapSettings = new MapSettingModel();

        const { data: mapResponse } = await requestOnlyMap(
            well,
            plastId,
            historyDate,
            modeMapType === ModeMapEnum.Accumulated,
            !isNullOrEmpty(selectedWells) ? map(it => it.id, selectedWells) : null
        );

        mapSettings.points = MapService.get(mapResponse.map); // todo mb
        mapSettings.contour = mapResponse.contour;
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

        set(mapSettingsState, mapSettings);

        set(isLoadingState, false);
    });

    const exportGrid = useRecoilCallback(({ snapshot, set }) => async () => {
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);
        const gridMap = await snapshot.getPromise(currentGridMap);
        const historyDate = await snapshot.getPromise(historyDateState);
        const mapSettings = await snapshot.getPromise(mapSettingsState);

        if (gridMap === GridMapEnum.None) {
            return;
        }

        set(isLoadingState, true);

        const response = await getExportMapGrid(
            gridMap,
            well,
            plastId,
            new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange)
        );

        downloadFile(response);

        set(isLoadingState, false);
    });

    return {
        reload,
        exportGrid
    };
}
