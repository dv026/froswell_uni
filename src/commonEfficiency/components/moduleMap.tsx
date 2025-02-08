import React from 'react';

import { currentGridMap } from 'calculation/store/gridMap';
import { MapCanvas } from 'common/components/mapCanvas/mapCanvas';
import { MapOilReservesResultType, OilReserves } from 'common/components/mapCanvas/oilReserves';
import { GridMapSettings } from 'common/entities/gridMapSettings';
import { KeyValue } from 'common/entities/keyValue';
import { BackgroundCanvasLayer } from 'common/entities/mapCanvas/layers/backgroundCanvasLayer';
import { ContourCanvasLayer } from 'common/entities/mapCanvas/layers/contourCanvasLayer';
import { GridImageCanvasLayer } from 'common/entities/mapCanvas/layers/gridImageCanvasLayer';
import { HydraulicFractureCanvasLayer } from 'common/entities/mapCanvas/layers/hydraulicFractureCanvasLayer';
import { IsolineCanvasLayer } from 'common/entities/mapCanvas/layers/isolineCanvasLayer';
import { ScaleGridPanelCanvasLayer } from 'common/entities/mapCanvas/layers/scaleGridPanelCanvasLayer';
import { TrajectoryCanvasLayer } from 'common/entities/mapCanvas/layers/trajectoryCanvasLayer';
import { WellBrief } from 'common/entities/wellBrief';
import { InjWellPoint, isInj, isOil } from 'common/entities/wellPoint';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { MapSelectionType } from 'common/enums/mapSelectionType';
import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { dateWithoutZone } from 'common/helpers/date';
import { downloadFile } from 'common/helpers/file';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { appearanceSettingsState } from 'commonEfficiency/store/appearanceSettings';
import { getExportMapGrid } from 'input/gateways';
import { mapSettingsState } from 'inputEfficiency/store/mapSettings';
import { modulePalette, scaleMeasure } from 'prediction/subModules/results/helpers/map';
import { WellPoint } from 'proxy/entities/proxyMap/wellPoint';
import { filter, map } from 'ramda';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { isLoadingState } from '../../proxy/subModules/efficiency/store/moduleMapMutations';
import { currentPlastId } from '../store/currentPlastId';
import { displayModeState } from '../store/displayMode';
import { historyDateState } from '../store/historyDate';
import { modeMapTypeState } from '../store/modeMapType';
import { selectedWellsState } from '../store/selectedWells';
import { InjWellsCanvasLayer } from './moduleMap/layers/injWellsCanvasLayer';
import { OilWellsCanvasLayer } from './moduleMap/layers/oilWellsCanvasLayer';
import { OperationDistributionCanvasLayer } from './moduleMap/layers/operationDistributionCanvasLayer';

interface ModuleMapProps {
    gridSettings: GridMapSettings;
    mapSettings: MapSettingModel;
    selectedOperations: KeyValue[];
    well: WellBrief;
    onChangeWell: (well: WellBrief) => void;
}

export const ModuleMap = (props: ModuleMapProps) => {
    const { gridSettings, mapSettings, selectedOperations, well, onChangeWell } = props;

    const appearance = useRecoilValue(appearanceSettingsState);
    const gridMap = useRecoilValue(currentGridMap);
    const historyDate = useRecoilValue(historyDateState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);

    const setDisplayMode = useSetRecoilState(displayModeState);
    const setSelectedWells = useSetRecoilState(selectedWellsState);

    const exportGrid = useRecoilCallback(({ snapshot, set }) => async () => {
        const plastId = await snapshot.getPromise(currentPlastId);
        const gridMap = await snapshot.getPromise(currentGridMap);
        const historyDate = await snapshot.getPromise(historyDateState);

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

    if (!mapSettings || isNullOrEmpty(mapSettings?.points)) {
        return null;
    }

    const changeWell = (type: WellTypeEnum, id: number) => {
        onChangeWell(new WellBrief(well.oilFieldId, id, well.prodObjId, type, well.scenarioId, well.subScenarioId));
    };

    const multipleWellsSelected = (wells, type) => {
        if (!isNullOrEmpty(wells)) {
            if (type === MapSelectionType.Contour) {
                setDisplayMode(DisplayModeEnum.Chart);
            } else if (type === MapSelectionType.Profile) {
                setDisplayMode(DisplayModeEnum.TabletNew);
            }
        }

        setSelectedWells(
            map(
                it =>
                    new WellBrief(well.oilFieldId, it.id, well.prodObjId, it.type, well.scenarioId, well.subScenarioId),
                wells
            )
        );
    };

    return (
        <MapCanvas
            key={`efficiency_map_${well.toString()}_${plastId}`}
            layers={[
                new BackgroundCanvasLayer(mapSettings.canvasSize),
                new GridImageCanvasLayer(
                    gridSettings.image,
                    gridSettings.grids,
                    gridMap,
                    gridSettings.stepSize,
                    mapSettings.canvasSize
                ),
                new IsolineCanvasLayer(gridSettings.isolines, mapSettings.canvasSize),
                new ContourCanvasLayer(mapSettings.contour, mapSettings.canvasSize),
                new OperationDistributionCanvasLayer(
                    true,
                    mapSettings.points,
                    mapSettings.operationDistribution,
                    selectedOperations,
                    mapSettings.canvasSize
                ),
                new OilWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isOil, mapSettings.points) as unknown as WellPoint[],
                    modeMapType,
                    true,
                    false,
                    id => changeWell(WellTypeEnum.Oil, id)
                ),
                new InjWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isInj, mapSettings.points) as InjWellPoint[],
                    modeMapType,
                    true,
                    false,
                    id => changeWell(WellTypeEnum.Injection, id)
                ),
                new HydraulicFractureCanvasLayer(
                    filter(x => x.grpState > 0, mapSettings.points),
                    mapSettings.canvasSize
                ),
                new TrajectoryCanvasLayer(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    mapSettings.points as unknown as any,
                    appearance.showTrajectory,
                    mapSettings.canvasSize
                ),
                new ScaleGridPanelCanvasLayer(
                    gridSettings.grids,
                    gridSettings.scaleRange,
                    gridMap,
                    modulePalette,
                    gridSettings.stepSize,
                    scaleMeasure(gridMap),
                    mapSettings.canvasSize
                )
            ]}
            points={mapSettings.points}
            activeWell={well.id}
            plastId={plastId}
            canvasSize={mapSettings.canvasSize}
            multipleWellsSelected={multipleWellsSelected}
            additionalPoints={gridSettings.grids}
            gridStepSize={gridSettings.stepSize}
            showZValue={gridMap !== GridMapEnum.None}
            onSelectWell={(id: number, type: WellTypeEnum) => changeWell(type, id)}
            onExportGrid={exportGrid}
            mainControlHideTools={{
                search: true,
                contour: true,
                profile: true,
                reservesCalculation: true,
                export: true
            }}
        >
            <OilReserves
                polygon={null}
                productionObjectId={well.prodObjId}
                plastId={plastId}
                scenarioId={well.scenarioId}
                subScenarioId={well.subScenarioId}
                dt={dateWithoutZone(new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.minRange))}
                resultType={MapOilReservesResultType.Prediction}
            />
        </MapCanvas>
    );
};
