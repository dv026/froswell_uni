import React, { useCallback } from 'react';

import { ContourModificationCanvasLayer } from 'common/entities/mapCanvas/layers/contourModificationCanvasLayer';
import { PieChartNaturalCanvasLayer } from 'common/entities/mapCanvas/layers/pieChartNaturalCanvasLayer';
import { PieChartVariationLossesCanvasLayer } from 'common/entities/mapCanvas/layers/pieChartVariationLossesCanvasLayer';
import { WellCommentsCanvasLayer } from 'common/entities/mapCanvas/layers/wellCommentsCanvasLayer';
import { truncateString } from 'common/helpers/strings';
import { mapScaleState } from 'common/store/mapScale';
import { krigingVariationLossesState, variationLossesSelector } from 'input/store/map/krigingVariationLosses';
import { useWellMutations } from 'input/store/wellMutations';
import { any, filter, find, flatten, forEach, includes, map, mapObjIndexed, uniq } from 'ramda';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { MapCanvas } from '../../common/components/mapCanvas/mapCanvas';
import { OilReserves, MapOilReservesResultType } from '../../common/components/mapCanvas/oilReserves';
import { AccumulatedFlowCanvasLayer } from '../../common/entities/mapCanvas/layers/accumulatedFlowCanvasLayer';
import { BackgroundCanvasLayer } from '../../common/entities/mapCanvas/layers/backgroundCanvasLayer';
import { ContourCanvasLayer } from '../../common/entities/mapCanvas/layers/contourCanvasLayer';
import { DrilledFoundationCanvasLayer } from '../../common/entities/mapCanvas/layers/drilledFoundationCanvasLayer';
import { GridImageCanvasLayer } from '../../common/entities/mapCanvas/layers/gridImageCanvasLayer';
import { HydraulicFractureCanvasLayer } from '../../common/entities/mapCanvas/layers/hydraulicFractureCanvasLayer';
import { InjWellsCanvasLayer } from '../../common/entities/mapCanvas/layers/injWellsCanvasLayer';
import { IsolineCanvasLayer } from '../../common/entities/mapCanvas/layers/isolineCanvasLayer';
import { OilWellsCanvasLayer } from '../../common/entities/mapCanvas/layers/oilWellsCanvasLayer';
import { PieChartCanvasLayer } from '../../common/entities/mapCanvas/layers/pieChartCanvasLayer';
import { ScaleGridPanelCanvasLayer } from '../../common/entities/mapCanvas/layers/scaleGridPanelCanvasLayer';
import { TrajectoryCanvasLayer } from '../../common/entities/mapCanvas/layers/trajectoryCanvasLayer';
import { WellDateEnum } from '../../common/entities/mapCanvas/wellDateLabel';
import { WellBrief } from '../../common/entities/wellBrief';
import { InjWellPoint, isInj, isOil, WellPoint, WellPointDonut } from '../../common/entities/wellPoint';
import { DisplayModeEnum } from '../../common/enums/displayModeEnum';
import { FundTypeEnum } from '../../common/enums/fundTypeEnum';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { MapSelectionType } from '../../common/enums/mapSelectionType';
import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { dateWithoutZone } from '../../common/helpers/date';
import { inputPalette } from '../../common/helpers/map/palette';
import { groupByProp, isNullOrEmpty } from '../../common/helpers/ramda';
import { scaleMeasure } from '../helpers/scaleMeasure';
import { displayModeState } from '../store/displayMode';
import { appearanceSettingsState } from '../store/map/appearanceSettings';
import { currentGridMap } from '../store/map/gridMap';
import { gridMapSettings } from '../store/map/gridMapSettings';
import { historyDateState } from '../store/map/historyDate';
import { mapDateLabels } from '../store/map/mapDateLabels';
import { mapSettingsState } from '../store/map/mapSettings';
import { modeMapTypeState } from '../store/map/modeMapType';
import { useModuleMapMutations } from '../store/map/moduleMapMutations';
import { wellStockState } from '../store/map/wellStock';
import { currentPlastId } from '../store/plast';
import { selectedWellsState } from '../store/selectedWells';
import { currentSpot } from '../store/well';

export const ModuleMap = () => {
    const appearance = useRecoilValue(appearanceSettingsState);
    const dateLabels = useRecoilValue(mapDateLabels);
    const gridMap = useRecoilValue(currentGridMap);
    const gridSettings = useRecoilValue(gridMapSettings);
    const historyDate = useRecoilValue(historyDateState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);
    const stock = useRecoilValue(wellStockState);
    const variationLosses = useRecoilValue(variationLossesSelector);
    const variationLossesSettings = useRecoilValue(krigingVariationLossesState);
    const well = useRecoilValue(currentSpot);

    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const setDisplayMode = useSetRecoilState(displayModeState);

    const dispatcher = useModuleMapMutations();

    const wellMutation = useWellMutations();

    const changeWellRoute = useCallback(
        (id: number, type: WellTypeEnum) => {
            wellMutation.set(new WellBrief(well.oilFieldId, id, well.prodObjId, type));
            setSelectedWells([]);
        },
        [setSelectedWells, wellMutation, well.oilFieldId, well.prodObjId]
    );

    const multipleWellsSelected = useCallback(
        (wells: WellPoint[], type: MapSelectionType) => {
            if (!isNullOrEmpty(wells)) {
                if (type === MapSelectionType.Contour) {
                    setDisplayMode(DisplayModeEnum.Chart);
                } else if (type === MapSelectionType.Profile) {
                    setDisplayMode(DisplayModeEnum.TabletNew);
                }
            }

            setSelectedWells(uniq(map(it => new WellBrief(well.oilFieldId, it.id, well.prodObjId, it.type), wells)));
        },
        [setDisplayMode, setSelectedWells, well.oilFieldId, well.prodObjId]
    );

    if (!mapSettings?.points) {
        return null;
    }

    const points = (
        includes(FundTypeEnum.DrilledFoundation, stock)
            ? flatten([mapSettings.points, mapSettings.drilledFoundationPoints])
            : mapSettings.points
    ) as WellPointDonut[];

    const drilledPoints = includes(FundTypeEnum.DrilledFoundation, stock) ? mapSettings.drilledFoundationPoints : [];

    const visibleActiveStockTrajectory = any(
        it => it.type === FundTypeEnum.ActiveStock && it.param === WellDateEnum.Trajectory && it.value,
        dateLabels
    );

    const visibleDrilledFoundationTrajectory = any(
        it => it.type === FundTypeEnum.DrilledFoundation && it.param === WellDateEnum.Trajectory && it.value,
        dateLabels
    );

    const wellComments = [];

    mapObjIndexed((item, key) => {
        const wellId = +key;
        const w = find(it => it.id === wellId, mapSettings.points);

        if (w) {
            wellComments.push({
                wellId: wellId,
                x: w.x,
                y: w.y,
                comments: map(x => truncateString(x?.comment, 20), item)
            });
        }
    }, groupByProp('wellId', mapSettings.wellComments));

    const keyWells = map(it => it.toString(), isNullOrEmpty(selectedWells) ? [well] : selectedWells).join();

    return (
        <MapCanvas
            key={`input_map_${keyWells}_${plastId}`}
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
                    true,
                    !variationLossesSettings?.visible,
                    mapSettings.canvasSize
                ),
                new PieChartNaturalCanvasLayer(
                    appearance.showNaturalRadius,
                    mapSettings.fullPoints,
                    mapSettings.canvasSize
                ),
                new AccumulatedFlowCanvasLayer(
                    mapSettings.tracerResearches,
                    appearance.showTracerResearch,
                    false,
                    true,
                    mapSettings.canvasSize
                ),
                new OilWellsCanvasLayer(
                    mapSettings.canvasSize,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    filter(isOil, mapSettings.points) as any,
                    modeMapType,
                    true,
                    appearance.showOpeningMode,
                    id => changeWellRoute(WellTypeEnum.Oil, id),
                    !variationLossesSettings?.visible
                ),
                new InjWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isInj, mapSettings.points) as InjWellPoint[],
                    modeMapType,
                    true,
                    appearance.showOpeningMode,
                    id => changeWellRoute(WellTypeEnum.Injection, id),
                    !variationLossesSettings?.visible
                ),
                new DrilledFoundationCanvasLayer(
                    includes(FundTypeEnum.DrilledFoundation, stock),
                    drilledPoints,
                    mapSettings.canvasSize
                ),
                new HydraulicFractureCanvasLayer(
                    filter((x: WellPointDonut) => x.grpState > 0, mapSettings.points),
                    mapSettings.canvasSize
                ),
                new PieChartVariationLossesCanvasLayer(
                    variationLosses,
                    mapSettings.pieScale,
                    variationLossesSettings?.visible,
                    mapSettings.canvasSize
                ),
                new TrajectoryCanvasLayer(
                    // TODO: типизация
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    mapSettings.points as unknown as any,
                    visibleActiveStockTrajectory,
                    mapSettings.canvasSize
                ),
                new TrajectoryCanvasLayer(
                    // TODO: типизация
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    drilledPoints as unknown as any,
                    visibleDrilledFoundationTrajectory,
                    mapSettings.canvasSize
                ),
                new ScaleGridPanelCanvasLayer(
                    gridSettings.grids,
                    gridSettings.scaleRange,
                    gridMap,
                    inputPalette,
                    gridSettings.stepSize,
                    scaleMeasure(gridMap),
                    mapSettings.canvasSize
                ),
                new WellCommentsCanvasLayer(wellComments, appearance.showWellComments, mapSettings.canvasSize)
                // new LegendCanvasLayer(modeMapType, mapSettings.canvasSize)
            ]}
            points={points}
            activeWell={well.id}
            prodObjId={well.prodObjId}
            canvasSize={mapSettings.canvasSize}
            multipleWellsSelected={multipleWellsSelected}
            mainControlHideTools={{
                search: true,
                contour: true,
                profile: true,
                reservesCalculation: true,
                export: true
            }}
            additionalPoints={gridSettings.grids}
            showZValue={gridMap !== GridMapEnum.None}
            gridStepSize={gridSettings.stepSize}
            onSelectWell={changeWellRoute}
            onExportGrid={dispatcher.exportGrid}
        >
            <OilReserves
                polygon={null}
                productionObjectId={well.prodObjId}
                plastId={plastId}
                dt={dateWithoutZone(new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange))}
                resultType={MapOilReservesResultType.Input}
            />
        </MapCanvas>
    );
};
