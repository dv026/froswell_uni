import React, { FC } from 'react';

import { Flex } from '@chakra-ui/react';
import { any, append, equals, filter, find, flatten, includes, map, pipe, reject, sortBy, uniqBy } from 'ramda';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { WellGroupItem } from '../../../calculation/entities/wellGroupItem';
import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { currentGridMap } from '../../../calculation/store/gridMap';
import { selectedPolygonState, togglePolygonState } from '../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../calculation/store/selectedAdditionalWell';
import { selectedWellsState } from '../../../calculation/store/selectedWells';
import { MapCanvas } from '../../../common/components/mapCanvas/mapCanvas';
import { Point } from '../../../common/entities/canvas/point';
import { AquiferCanvasLayer } from '../../../common/entities/mapCanvas/layers/aquiferCanvasLayer';
import { BackgroundCanvasLayer } from '../../../common/entities/mapCanvas/layers/backgroundCanvasLayer';
import { ContourCanvasLayer } from '../../../common/entities/mapCanvas/layers/contourCanvasLayer';
import { GridImageCanvasLayer } from '../../../common/entities/mapCanvas/layers/gridImageCanvasLayer';
import { HighlightWellsCanvasLayer } from '../../../common/entities/mapCanvas/layers/highlightWellsCanvasLayer';
import { IsolineCanvasLayer } from '../../../common/entities/mapCanvas/layers/isolineCanvasLayer';
import { PlastNamesCanvasLayer } from '../../../common/entities/mapCanvas/layers/plastNamesCanvasLayer';
import { PolygonGroupCanvasLayer } from '../../../common/entities/mapCanvas/layers/polygonGroupCanvasLayer';
import { ScaleGridPanelCanvasLayer } from '../../../common/entities/mapCanvas/layers/scaleGridPanelCanvasLayer';
import { SelectedWellsCanvasLayer } from '../../../common/entities/mapCanvas/layers/selectedWellsCanvasLayer';
import { TrajectoryCanvasLayer } from '../../../common/entities/mapCanvas/layers/trajectoryCanvasLayer';
import { WellDateEnum } from '../../../common/entities/mapCanvas/wellDateLabel';
import { WellBrief } from '../../../common/entities/wellBrief';
import { WellPoint as WellPointBase } from '../../../common/entities/wellPoint';
import { FundTypeEnum } from '../../../common/enums/fundTypeEnum';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { inputPalette } from '../../../common/helpers/map/palette';
import { distance, round1 } from '../../../common/helpers/math';
import { shallow } from '../../../common/helpers/ramda';
import { scaleMeasure } from '../../../input/helpers/scaleMeasure';
import { optimizationWellsState } from '../../../optimization/subModules/wellGroup/store/optimizationWells';
import { optimisationData } from '../../../prediction/subModules/wellGrid/components/optimization/dataManager';
import { OptimisationTitleBrief } from '../../entities/proxyMap/optimisationTitleBrief';
import { WellPoint } from '../../entities/proxyMap/wellPoint';
import { OptimisationParamEnum } from '../../enums/wellGrid/optimisationParam';
import { gridMapSettings } from '../../store/map/gridMapSettings';
import { mapSettingsState } from '../../store/map/mapSettings';
import { optimizationParametersState } from '../../store/map/optimizationParameters';
import { useProxyMapMutations } from '../../store/map/proxyMapMutations';
import { wellGridState } from '../../store/map/wellGrid';
import { wellStockState } from '../../store/map/wellStock';
import { currentSpot } from '../../store/well';
import { adaptationEditModelState } from '../../subModules/editModel/store/adaptationEditModel';
import { adaptationWellGroupState } from '../../subModules/wellGroup/store/adaptationWellGroup';
import { CalculationImaginaryCanvasLayer } from './layers/calculationImaginaryCanvasLayer';
import { DrilledFoundationCanvasLayer } from './layers/drilledFoundationCanvasLayer';
import { ImaginaryWellsCanvasLayer } from './layers/imaginaryWellsCanvasLayer';
import { InjWellsCanvasLayer } from './layers/injWellsCanvasLayer';
import { IntermediateWellsCanvasLayer } from './layers/intermediateWellsCanvasLayer';
import { InterwellConnectionsCanvasLayer } from './layers/interwellConnectionsCanvasLayer';
import { OilWellsCanvasLayer } from './layers/oilWellsCanvasLayer';
import { UnknownWellsCanvasLayer } from './layers/unknownWellsCanvasLayer';
import { WellPropertiesCanvasLayer } from './layers/wellPropertiesCanvasLayer';
import { CloseCommandWellPopover, WellPopover } from './wellPopover';

const defaultMinWellDistance = 70;

export const isType = (x: WellPoint, type: WellTypeEnum): boolean => equals(x.type, type);
export const isOil = (x: WellPoint): boolean => isType(x, WellTypeEnum.Oil);
export const isInj = (x: WellPoint): boolean => isType(x, WellTypeEnum.Injection);
export const isUnknown = (x: WellPoint): boolean =>
    !isType(x, WellTypeEnum.Injection) && !isType(x, WellTypeEnum.Oil) && !x.isDrilledFoundation;

interface Props {
    isWellGrid?: boolean;
    isWellGroup?: boolean;
    mode: CalculationModeEnum;
}

export const ModuleMap: FC<Props> = (p: Props) => {
    const adaptationEditModel = useRecoilValue(adaptationEditModelState);
    const gridMap = useRecoilValue(currentGridMap);
    const gridSettings = useRecoilValue(gridMapSettings);
    const mapSettings = useRecoilValue(mapSettingsState);
    const optimizationParameters = useRecoilValue(optimizationParametersState);
    const plastId = useRecoilValue(currentPlastId);
    const selectedAdditionalWell = useRecoilValue(selectedAdditionalWellState);
    const stock = useRecoilValue(wellStockState);
    const togglePolygon = useRecoilValue(togglePolygonState);
    const well = useRecoilValue(currentSpot);
    const wellGrid = useRecoilValue(wellGridState);

    const setSelectedPolygon = useSetRecoilState(selectedPolygonState);
    const setSelectedWells = useSetRecoilState(selectedWellsState);

    const [adaptationWellGroup, setAdaptationWellGroup] = useRecoilState(adaptationWellGroupState);
    const [optimizationWells, setOptimizationWells] = useRecoilState(optimizationWellsState);

    const [isOpenPopover, setIsOpenPopover] = React.useState(false);
    const [wellPopover, setWellPopover] = React.useState(null);
    const [horizontalBarrel, setHorizontalBarrel] = React.useState<number>(null);

    const dispatcher = useProxyMapMutations();

    if (!mapSettings?.points) {
        return null;
    }

    const imaginaryPoints = makeImaginaryPoints(mapSettings.imaginaryPoints, plastId);

    let oilPoints = [];
    let injPoints = [];

    // виртуальные без характера работы
    const unknownPoints = filter(isUnknown, mapSettings.currentFundWithImaginary);

    oilPoints = filter(isOil, mapSettings.currentFundWithImaginary);
    injPoints = filter(isInj, mapSettings.currentFundWithImaginary);

    // TODO: теоретически, скважины могут быть дублированы. Необходимо пересмотреть логику определения всех скважин
    // TODO: или логику определения каждого набора скважин
    const concatedPoints: WellPoint[] = flatten([
        mapSettings.points,
        imaginaryPoints,
        mapSettings.intermediatePoints,
        mapSettings.drilledPoints,
        mapSettings.currentFundWithImaginary
    ]);
    const allPoint = pipe(
        map((it: WellPoint) => new WellPointBase(it.id, it.x, it.y, it.type, it.name)),
        uniqBy(x => x.name)
    )(concatedPoints);

    let optimisation = [];

    const selectedWell = wellPopover ? find(it => it.id === wellPopover.wellId, allPoint) : null;

    const isProxy = p.mode === CalculationModeEnum.Creation || p.mode === CalculationModeEnum.Improvement;
    const isImprovement = p.mode === CalculationModeEnum.Improvement;
    const isPrediction = p.mode === CalculationModeEnum.Prediction;
    const isOptimization = p.mode === CalculationModeEnum.Optimization;

    // todo mb helper?
    if (isPrediction && p.isWellGrid) {
        optimisation = map(it => {
            const data = optimisationData(
                optimizationParameters,
                OptimisationParamEnum.PresureZab,
                it.wellId,
                it.wellType
            );

            return new OptimisationTitleBrief(
                OptimisationParamEnum.PresureZab,
                it.wellId,
                it.wellType,
                round1(data.defaultValue),
                round1(data.currentValue)
            );
        }, optimizationParameters.originalOptimisation ?? []);

        optimisation = flatten([
            optimisation,
            map(
                it =>
                    new OptimisationTitleBrief(
                        OptimisationParamEnum.SkinFactor,
                        it.wellId,
                        null,
                        round1(it.defaultValue),
                        round1(it.value)
                    ),
                optimizationParameters.optimisationSkinFactor ?? []
            )
        ]);
    }

    const plastNames = map(
        it => ({
            wellId: it.id,
            x: it.x,
            y: it.y,
            plastNames: it.plastNames ? it.plastNames.split(',') : null
        }),
        flatten([
            includes(FundTypeEnum.ActiveStock, stock) ? mapSettings.points : [],
            includes(FundTypeEnum.VirtualWells, stock) ? mapSettings.imaginaryPoints : []
        ])
    );

    const wellProperties = filter(
        it =>
            includes(
                it.wellId,
                map(
                    x => x.id,
                    flatten([
                        includes(FundTypeEnum.ActiveStock, stock) ? mapSettings.points : [],
                        includes(FundTypeEnum.VirtualWells, stock) ? mapSettings.imaginaryPoints : [],
                        includes(FundTypeEnum.IntermediateWells, stock) ? mapSettings.intermediatePoints : []
                    ])
                )
            ),
        adaptationEditModel
    );

    let highlightAdaptationWellGroup: WellPointBase[] = [];

    if (isProxy && p.isWellGroup) {
        const filtered = map(
            (x: WellGroupItem) => x.id,
            filter(it => it.selected, adaptationWellGroup)
        );
        highlightAdaptationWellGroup = filter(it => includes(it.id, filtered), allPoint);

        highlightAdaptationWellGroup = filterByWellStock(
            mapSettings.drilledPoints,
            highlightAdaptationWellGroup,
            includes(FundTypeEnum.DrilledFoundation, stock)
        );
    }

    let highlightOptimizationWells = [];

    if (isOptimization && p.isWellGroup) {
        const optimizationWellsFiltered = map(
            (x: WellGroupItem) => x.id,
            filter(it => it.selected, optimizationWells)
        );
        highlightOptimizationWells = filter(it => includes(it.id, optimizationWellsFiltered), allPoint);

        highlightOptimizationWells = filterByWellStock(
            mapSettings.drilledPoints,
            highlightOptimizationWells,
            includes(FundTypeEnum.DrilledFoundation, stock)
        );
    }

    const changeWellPosition = (point: WellPoint) => {
        dispatcher.changeWellPosition(point);
    };

    const onChangePolygonSelected = (polygon: number[][]) => {
        setSelectedPolygon(map(it => new Point(it[0], it[1]), polygon));
    };

    const onChangeSelectedWells = (wells: WellPoint[]) => {
        setSelectedWells(
            map(
                it =>
                    new WellBrief(well.oilFieldId, it.id, well.prodObjId, it.type, well.scenarioId, well.subScenarioId),
                wells
            )
        );
    };

    const onDoubleClickByMap = (point: number[]) => {
        if (!p.isWellGrid || !isProxy) {
            return;
        }

        // если рядом уже есть скважина - не добавлять
        if (find(it => distance(it.x, it.y, point[0], point[1]) < defaultMinWellDistance, allPoint)) {
            return;
        }

        dispatcher.addNewVirtualWell(new Point(point[0], point[1]));
    };

    const onClickByMap = (p: number[]) => {
        if (!horizontalBarrel) {
            return;
        }

        dispatcher.addHorizontalBarrel(horizontalBarrel, plastId, new Point(p[0], p[1]));

        setHorizontalBarrel(null);
    };

    const onSelectWell = (id: number, type: WellTypeEnum, pos: number[]) => {
        if (p.isWellGrid) {
            setWellPopover({
                wellId: id,
                wellType: type,
                offsetX: pos[2],
                offsetY: pos[3]
            });
            setIsOpenPopover(true);
        }

        if (p.isWellGroup) {
            if (isProxy) {
                const item = find(it => it.id === id, adaptationWellGroup);
                if (item) {
                    setAdaptationWellGroup(
                        sortBy(
                            x => x.name,
                            append(
                                shallow(item, { selected: !item.selected }),
                                reject((it: WellGroupItem) => it.id === id, adaptationWellGroup)
                            )
                        )
                    );
                }
            }

            if (isOptimization) {
                const item = find(it => it.id === id, optimizationWells);
                if (item) {
                    setOptimizationWells(
                        sortBy(
                            x => x.name,
                            append(
                                shallow(item, { selected: !item.selected }),
                                reject((it: WellGroupItem) => it.id === id, optimizationWells)
                            )
                        )
                    );
                }
            }
        }
    };

    const onCloseWellPopover = (commandType: CloseCommandWellPopover) => {
        setIsOpenPopover(false);
        setWellPopover(null);

        switch (commandType) {
            case CloseCommandWellPopover.AddHorizontalBarrel:
                setHorizontalBarrel(wellPopover.wellId);
                break;
            case CloseCommandWellPopover.RemoveHorizontalBarrel:
                dispatcher.removeHorizontalBarrel(wellPopover.wellId);
                setHorizontalBarrel(null);
                break;
            case CloseCommandWellPopover.SaveVirtualWell:
                dispatcher.saveAllImaginaryWells();
                break;
        }
    };

    return (
        <Flex position={'absolute'} w='100%' h='100%'>
            <WellPopover
                {...wellPopover}
                isPrediction={isPrediction}
                isOptimization={isOptimization}
                show={p.isWellGrid}
                isOpen={isOpenPopover}
                onClose={onCloseWellPopover}
            />
            <MapCanvas
                key={`well-grid_map_${well.toString()}_${plastId}`}
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
                    new AquiferCanvasLayer(
                        isProxy && p.isWellGrid && wellGrid.showAquifer,
                        mapSettings.aquifers,
                        mapSettings.canvasSize
                    ),
                    new SelectedWellsCanvasLayer(wellPopover ? [selectedWell] : [], mapSettings.canvasSize),
                    new PolygonGroupCanvasLayer(mapSettings.canvasSize, mapSettings.wellGroup),
                    new InterwellConnectionsCanvasLayer(
                        isProxy && p.isWellGrid && wellGrid.showInterwells,
                        mapSettings.interwellConnections,
                        mapSettings.canvasSize
                    ),
                    new HighlightWellsCanvasLayer(
                        highlightAdaptationWellGroup,
                        isProxy && p.isWellGroup,
                        mapSettings.canvasSize
                    ),
                    new HighlightWellsCanvasLayer(
                        highlightOptimizationWells,
                        isOptimization && p.isWellGroup,
                        mapSettings.canvasSize
                    ),
                    new ImaginaryWellsCanvasLayer(
                        includes(FundTypeEnum.VirtualWells, stock),
                        imaginaryPoints,
                        concatedPoints,
                        [], // todo mb?
                        optimisation,
                        mapSettings.optimisationSelectedParam,
                        mapSettings.contour,
                        horizontalBarrel,
                        isProxy && p.isWellGrid,
                        wellGrid.dateLabels,
                        changeWellPosition,
                        mapSettings.canvasSize
                    ),
                    new OilWellsCanvasLayer(
                        oilPoints,
                        [],
                        mapSettings.canvasSize,
                        mapSettings.optimisationSelectedParam,
                        optimisation
                    ),
                    new InjWellsCanvasLayer(
                        injPoints,
                        [],
                        mapSettings.canvasSize,
                        mapSettings.optimisationSelectedParam,
                        optimisation
                    ),
                    new UnknownWellsCanvasLayer(
                        unknownPoints,
                        mapSettings.canvasSize,
                        mapSettings.optimisationSelectedParam,
                        optimisation
                    ),
                    new DrilledFoundationCanvasLayer(
                        includes(FundTypeEnum.DrilledFoundation, stock),
                        mapSettings.drilledPoints,
                        wellGrid.dateLabels,
                        mapSettings.canvasSize
                    ),
                    new IntermediateWellsCanvasLayer(
                        includes(FundTypeEnum.IntermediateWells, stock),
                        mapSettings.intermediatePoints,
                        mapSettings.canvasSize
                    ),
                    new CalculationImaginaryCanvasLayer(null, mapSettings.canvasSize),
                    // new ImprovementCanvasLayer(
                    //     improvementMode,
                    //     improvementStatus.minX,
                    //     improvementStatus.maxX,
                    //     improvementStatus.minY,
                    //     improvementStatus.maxY,
                    //     improvementStatus.stepNumber,
                    //     mapSettings.canvasSize
                    // ),
                    new PlastNamesCanvasLayer(
                        plastNames,
                        !isImprovement && wellGrid.showPlastNames,
                        mapSettings.canvasSize
                    ),
                    new WellPropertiesCanvasLayer(wellProperties, isImprovement, mapSettings.canvasSize),
                    new TrajectoryCanvasLayer(
                        mapSettings.points,
                        includes(FundTypeEnum.ActiveStock, stock) &&
                            any(
                                it =>
                                    it.type === FundTypeEnum.ActiveStock &&
                                    it.param === WellDateEnum.Trajectory &&
                                    it.value,
                                wellGrid.dateLabels
                            ),
                        mapSettings.canvasSize
                    ),
                    new TrajectoryCanvasLayer(
                        mapSettings.drilledPoints,
                        includes(FundTypeEnum.DrilledFoundation, stock) &&
                            any(
                                it =>
                                    it.type === FundTypeEnum.DrilledFoundation &&
                                    it.param === WellDateEnum.Trajectory &&
                                    it.value,
                                wellGrid.dateLabels
                            ),
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
                    )
                ]}
                points={allPoint}
                activeWell={well.id}
                plastId={plastId}
                canvasSize={mapSettings.canvasSize}
                selectedAdditionalWell={selectedAdditionalWell}
                multipleWellsSelected={onChangeSelectedWells}
                additionalPoints={gridSettings.grids}
                gridStepSize={gridSettings.stepSize}
                showZValue={true}
                togglePolygon={togglePolygon}
                disableDragAndDrop={horizontalBarrel !== null}
                //disablePolygon={this.state.disablePolygon}
                //onChangeCursorPoint={this.onChangeCursorPoint}
                onChangePolygonSelected={onChangePolygonSelected}
                onDoubleClick={onDoubleClickByMap}
                onClick={onClickByMap}
                onSelectWell={onSelectWell}
                mainControlHideTools={{
                    search: (isPrediction || isOptimization) && !p.isWellGrid && !p.isWellGroup
                }}
            />
        </Flex>
    );
};

const makeImaginaryPoints = (imaginaryPoints: WellPoint[], plastId: number): WellPoint[] =>
    reject((it: WellPoint) => it.plastId !== plastId, imaginaryPoints);

const filterByWellStock = (source: WellPointBase[], target: WellPointBase[], include: boolean): WellPointBase[] =>
    include
        ? target
        : reject(
              (it: WellPointBase) =>
                  includes(
                      it.id,
                      map(x => x.id, source)
                  ),
              target
          );
