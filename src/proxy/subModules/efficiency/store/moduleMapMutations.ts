import { currentPlastId } from 'calculation/store/currentPlastId';
import { currentGridMap } from 'calculation/store/gridMap';
import { toArray } from 'common/entities/gridAvailability';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { convertCanvasSize } from 'common/helpers/map/common';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { MapService } from 'input/services/mapService';
import { currentSpot } from 'proxy/store/well';
import { includes, map } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { evaluationTypeState } from '../../../../commonEfficiency/store/evaluationType';
import { gridMapSettings } from '../../../../commonEfficiency/store/gridMapSettings';
import { gtmModeState } from '../../../../commonEfficiency/store/gtmMode';
import { historyDateState } from '../../../../commonEfficiency/store/historyDate';
import { modeMapTypeState } from '../../../../commonEfficiency/store/modeMapType';
import { selectedWellsState } from '../../../../commonEfficiency/store/selectedWells';
import { getMapByParams } from '../gateways/gateway';
import { mapSettingsState } from './mapSettings';

export const isLoadingState = atom<boolean>({
    key: 'proxyEfficiencyMap__isLoadingState',
    default: false
});

export function useModuleMapMutations() {
    const reload = useRecoilCallback(({ snapshot, set, refresh }) => async (historyDate: Date) => {
        const evaluationType = await snapshot.getPromise(evaluationTypeState);
        const gridMap = await snapshot.getPromise(currentGridMap);
        const gtmType = await snapshot.getPromise(gtmModeState);
        const mode = await snapshot.getPromise(modeMapTypeState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const selectedWells = await snapshot.getPromise(selectedWellsState);
        const well = await snapshot.getPromise(currentSpot);

        set(isLoadingState, true);

        set(historyDateState, historyDate);

        const mapSettings = new MapSettingModel();

        const response = await getMapByParams(
            well,
            plastId,
            historyDate,
            !isNullOrEmpty(selectedWells) ? map(it => it.id, selectedWells) : null,
            evaluationType,
            gtmType,
            mode === ModeMapEnum.Accumulated
        );

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
