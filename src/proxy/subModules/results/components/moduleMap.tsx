import React, { FC, useCallback } from 'react';

import { DrilledFoundationCanvasLayer } from 'common/entities/mapCanvas/layers/drilledFoundationCanvasLayer';
import { concat, filter, flatten, isNil, map } from 'ramda';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentGridMap } from '../../../../calculation/store/gridMap';
import { MapCanvas } from '../../../../common/components/mapCanvas/mapCanvas';
import { MapOilReservesResultType, OilReserves } from '../../../../common/components/mapCanvas/oilReserves';
import { AccumulatedFlowCanvasLayer } from '../../../../common/entities/mapCanvas/layers/accumulatedFlowCanvasLayer';
import { BackgroundCanvasLayer } from '../../../../common/entities/mapCanvas/layers/backgroundCanvasLayer';
import { CompensationCanvasLayer } from '../../../../common/entities/mapCanvas/layers/compensationCanvasLayer';
import { ContourCanvasLayer } from '../../../../common/entities/mapCanvas/layers/contourCanvasLayer';
import { FlowCanvasLayer } from '../../../../common/entities/mapCanvas/layers/flowCanvasLayer';
import { GridImageCanvasLayer } from '../../../../common/entities/mapCanvas/layers/gridImageCanvasLayer';
import { HydraulicFractureCanvasLayer } from '../../../../common/entities/mapCanvas/layers/hydraulicFractureCanvasLayer';
import { InflowProfileCanvasLayer } from '../../../../common/entities/mapCanvas/layers/inflowProfileCanvasLayer';
import { InjWellsCanvasLayer } from '../../../../common/entities/mapCanvas/layers/injWellsCanvasLayer';
import { IsolineCanvasLayer } from '../../../../common/entities/mapCanvas/layers/isolineCanvasLayer';
import { OilWellsCanvasLayer } from '../../../../common/entities/mapCanvas/layers/oilWellsCanvasLayer';
import { PieChartCanvasLayer } from '../../../../common/entities/mapCanvas/layers/pieChartCanvasLayer';
import { ScaleGridPanelCanvasLayer } from '../../../../common/entities/mapCanvas/layers/scaleGridPanelCanvasLayer';
import { TrajectoryCanvasLayer } from '../../../../common/entities/mapCanvas/layers/trajectoryCanvasLayer';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { InjWellPoint, isInj, isOil } from '../../../../common/entities/wellPoint';
import { DisplayModeEnum } from '../../../../common/enums/displayModeEnum';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { MapSelectionType } from '../../../../common/enums/mapSelectionType';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { dateWithoutZone } from '../../../../common/helpers/date';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { modulePalette, scaleMeasure } from '../../../../prediction/subModules/results/helpers/map';
import { WellPoint } from '../../../../proxy/entities/proxyMap/wellPoint';
import { currentSpot } from '../../../store/well';
import { useWellMutations } from '../../../store/wellMutations';
import { appearanceSettingsState } from '../store/appearanceSettings';
import { displayModeState } from '../store/displayMode';
import { gridMapSettings } from '../store/gridMapSettings';
import { historyDateState } from '../store/historyDate';
import { mapSettingsState } from '../store/mapSettings';
import { modeMapTypeState } from '../store/modeMapType';
import { useModuleMapMutations } from '../store/moduleMapMutations';
import { selectedWellsState } from '../store/selectedWells';

export const ModuleMap = () => {
    const appearance = useRecoilValue(appearanceSettingsState);
    const gridMap = useRecoilValue(currentGridMap);
    const gridSettings = useRecoilValue(gridMapSettings);
    const historyDate = useRecoilValue(historyDateState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);
    const well = useRecoilValue(currentSpot);

    const setDisplayMode = useSetRecoilState(displayModeState);
    const setSelectedWells = useSetRecoilState(selectedWellsState);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    const dispatcher = useModuleMapMutations();
    const wellMutations = useWellMutations();

    const changeWell = useCallback(
        (id: number, type: WellTypeEnum) => {
            wellMutations.set(
                new WellBrief(well.oilFieldId, id, well.prodObjId, type, well.scenarioId, well.subScenarioId)
            );

            setSelectedWells([]);
            resetMapSettings();
        },
        [
            resetMapSettings,
            setSelectedWells,
            well.oilFieldId,
            well.prodObjId,
            well.scenarioId,
            well.subScenarioId,
            wellMutations
        ]
    );

    const multipleWellsSelected = useCallback(
        (wells, type) => {
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
                        new WellBrief(
                            well.oilFieldId,
                            it.id,
                            well.prodObjId,
                            it.type,
                            well.scenarioId,
                            well.subScenarioId
                        ),
                    wells
                )
            );
        },
        [setDisplayMode, setSelectedWells, well.oilFieldId, well.prodObjId, well.scenarioId, well.subScenarioId]
    );

    if (!mapSettings || isNullOrEmpty(mapSettings?.points)) {
        return null;
    }

    const oilInflowProfiles = map(
        it => ({
            wellId: it.wellId,
            x: it.x,
            y: it.y,
            plastName: it.plastName,
            plastNumber: it.plastNumber,
            value: modeMapType === ModeMapEnum.Daily ? it.perLiq : it.perLiqAccumulated,
            wellType: WellTypeEnum.Oil
        }),
        mapSettings.inflowProfiles
    );

    const injInflowProfiles = map(
        it => ({
            wellId: it.wellId,
            x: it.x,
            y: it.y,
            plastName: it.plastName,
            plastNumber: it.plastNumber,
            value: modeMapType === ModeMapEnum.Daily ? it.perInj : it.perInjAccumulated,
            wellType: WellTypeEnum.Injection
        }),
        mapSettings.inflowProfiles
    );

    const isObject = isNil(plastId);

    return (
        <MapCanvas
            key={`prediction_map_${well.toString()}_${plastId}`}
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
                new PieChartCanvasLayer(
                    well.id,
                    modeMapType,
                    mapSettings.points,
                    mapSettings.pieScale,
                    false,
                    true,
                    mapSettings.canvasSize
                ),
                new AccumulatedFlowCanvasLayer(
                    mapSettings.tracerResearches,
                    appearance.showTracerResearch,
                    false,
                    true,
                    mapSettings.canvasSize
                ),
                new AccumulatedFlowCanvasLayer(
                    mapSettings.accumulatedFlows,
                    appearance.showLiquidDistribution,
                    appearance.scaleLiquidDistributionByWell,
                    false,
                    mapSettings.canvasSize
                ),
                new OilWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isOil, mapSettings.points) as unknown as WellPoint[],
                    modeMapType,
                    true,
                    appearance.showOpeningMode,
                    id => changeWell(WellTypeEnum.Oil, id)
                ),
                new InjWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isInj, mapSettings.points) as InjWellPoint[],
                    modeMapType,
                    true,
                    appearance.showOpeningMode,
                    id => changeWell(WellTypeEnum.Injection, id)
                ),
                new DrilledFoundationCanvasLayer(true, mapSettings.drilledFoundationPoints, mapSettings.canvasSize),
                new HydraulicFractureCanvasLayer(
                    filter(x => x.grpState > 0, mapSettings.points),
                    mapSettings.canvasSize
                ),
                new TrajectoryCanvasLayer(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    concat(mapSettings.points, mapSettings.drilledFoundationPoints) as unknown as any,
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
                ),
                new FlowCanvasLayer(
                    // TODO: типизация
                    mapSettings.flowInterwells as unknown as number[][][][],
                    !isObject && appearance.showFlowInterwells,
                    mapSettings.canvasSize
                ),
                new InflowProfileCanvasLayer(
                    flatten([oilInflowProfiles, injInflowProfiles]),
                    isObject && appearance.showInflowProfile,
                    mapSettings.canvasSize
                ),
                new CompensationCanvasLayer(
                    mapSettings.compensations,
                    !isObject && appearance.showCompensation,
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
            onSelectWell={changeWell}
            onExportGrid={dispatcher.exportGrid}
            mainControlHideTools={{
                search: true,
                contour: true,
                contourOptional: !isObject,
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
                dt={dateWithoutZone(new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange))}
                resultType={MapOilReservesResultType.Prediction}
            />
        </MapCanvas>
    );
};
