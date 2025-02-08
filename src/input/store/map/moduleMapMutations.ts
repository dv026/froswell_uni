import { isNullOrEmpty } from 'common/helpers/ramda';
import { map } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { toArray } from '../../../common/entities/gridAvailability';
import { KeyValue } from '../../../common/entities/keyValue';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { downloadFile } from '../../../common/helpers/file';
import { convertCanvasSize } from '../../../common/helpers/map/common';
import { MapSettingModel } from '../../entities/mapSettingModel';
import { getExportMapGrid, getMapByParams } from '../../gateways';
import { MapService } from '../../services/mapService';
import { dataTypeState } from '../dataType';
import { currentPlastId } from '../plast';
import { selectedWellsState } from '../selectedWells';
import { currentSpot } from '../well';
import { distributionTypeState } from './distributionType';
import { currentGridMap } from './gridMap';
import { historyDateState } from './historyDate';
import { mapSettingsState } from './mapSettings';

export const isLoadingState = atom<boolean>({
    key: 'inputMap__isLoadingState',
    default: false
});

export function useModuleMapMutations() {
    const reload = useRecoilCallback(({ snapshot, set }) => async (historyDate: Date) => {
        const dataType = await snapshot.getPromise(dataTypeState);
        const distributionType = await snapshot.getPromise(distributionTypeState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);
        const selectedWells = await snapshot.getPromise(selectedWellsState);

        set(isLoadingState, true);

        set(historyDateState, historyDate);

        const mapSettings = new MapSettingModel(); // todo mb

        const { data } = await getMapByParams(
            isNullOrEmpty(selectedWells) ? [well] : selectedWells,
            plastId,
            mapSettings.radius,
            dataType,
            distributionType,
            historyDate
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
