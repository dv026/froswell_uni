import { currentPlastId } from 'calculation/store/currentPlastId';
import { currentGridMap } from 'calculation/store/gridMap';
import { toArray } from 'common/entities/gridAvailability';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { convertCanvasSize } from 'common/helpers/map/common';
import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { MapService } from 'input/services/mapService';
import { currentSpot } from 'input/store/well';
import { includes } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { gtmModeState } from '../../commonEfficiency/store/gtmMode';
import { historyDateState } from '../../commonEfficiency/store/historyDate';
import { modeMapTypeState } from '../../commonEfficiency/store/modeMapType';
import { getMapByParams } from '../gateways/gateway';
import { gridMapSettings } from './gridMapSettings';
import { mapSettingsState } from './mapSettings';

export const isLoadingState = atom<boolean>({
    key: 'inputEfficiencyMap__isLoadingState',
    default: false
});

export function useModuleMapMutations() {
    const reload = useRecoilCallback(({ snapshot, set, refresh }) => async (historyDate: Date) => {
        const gridMap = await snapshot.getPromise(currentGridMap);
        const gtmType = await snapshot.getPromise(gtmModeState);
        const mode = await snapshot.getPromise(modeMapTypeState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);

        set(isLoadingState, true);

        set(historyDateState, historyDate);

        const mapSettings = new MapSettingModel();

        const response = await getMapByParams(well, plastId, historyDate, gtmType, mode === ModeMapEnum.Accumulated);

        mapSettings.points = MapService.get(response.data.map);
        mapSettings.contour = response.data.contour;
        mapSettings.mapHistoryRange = response.data.historyRange;
        mapSettings.canvasSize = convertCanvasSize(response.data.canvasSize);
        mapSettings.availableGrids = toArray<GridMapEnum>(response.data.availableGrids);
        mapSettings.operationDistribution = response.data.operationDistribution;

        set(mapSettingsState, mapSettings);

        if (
            includes(gridMap, [
                GridMapEnum.Pressure,
                GridMapEnum.VolumeWaterCut,
                GridMapEnum.CurrentOilSaturatedThickness,
                GridMapEnum.CurrentKH,
                GridMapEnum.SkinFactor
            ])
        ) {
            refresh(gridMapSettings);
        }

        set(isLoadingState, false);
    });

    return {
        reload
    };
}
