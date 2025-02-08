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
import { MapSettingModel } from '../../../entities/mapSettingModel';
import { currentSpot } from '../../../store/well';
import { getMapByParams } from '../gateways/gateway';
import { currentPlastId } from './currentPlastId';
import { historyDateState } from './historyDate';
import { mapSettingsState } from './mapSettings';
import { modeMapTypeState } from './modeMapType';
import { selectedWellsState } from './selectedWells';

export const isLoadingState = atom<boolean>({
    key: 'predictionMap__isLoadingState',
    default: false
});

export function useModuleMapMutations() {
    const reload = useRecoilCallback(({ snapshot, set }) => async (historyDate: Date) => {
        const modeMapType = await snapshot.getPromise(modeMapTypeState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const selectedWells = await snapshot.getPromise(selectedWellsState);
        const well = await snapshot.getPromise(currentSpot);

        set(isLoadingState, true);

        set(historyDateState, historyDate);

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

        set(mapSettingsState, mapSettings);

        set(isLoadingState, false);
    });

    const exportGrid = useRecoilCallback(({ snapshot, set }) => async () => {
        const gridMap = await snapshot.getPromise(currentGridMap);
        const historyDate = await snapshot.getPromise(historyDateState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);
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
