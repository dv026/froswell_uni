import React, { useState } from 'react';

import { Point } from 'common/entities/canvas/point';
import { ContourModelBrief } from 'common/entities/contourModelBrief';
import { ContourDragChangingCanvasLayer } from 'common/entities/mapCanvas/layers/contourDragChangingCanvasLayer';
import { ContourModificationCanvasLayer } from 'common/entities/mapCanvas/layers/contourModificationCanvasLayer';
import { activeContourIdState, activeContourSelector } from 'geologicalModel/store/activeContour';
import {
    changingPolygonState,
    contourEditModeState,
    selectedPolygonState,
    togglePolygonState
} from 'geologicalModel/store/contourEditMode';
import { currentPlastId } from 'geologicalModel/store/plast';
import { always, any, cond, filter, head, includes, map, reject, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { MapCanvas } from '../../common/components/mapCanvas/mapCanvas';
import { BackgroundCanvasLayer } from '../../common/entities/mapCanvas/layers/backgroundCanvasLayer';
import { ContourCanvasLayer } from '../../common/entities/mapCanvas/layers/contourCanvasLayer';
import { DrilledFoundationCanvasLayer } from '../../common/entities/mapCanvas/layers/drilledFoundationCanvasLayer';
import { GridImageCanvasLayer } from '../../common/entities/mapCanvas/layers/gridImageCanvasLayer';
import { HydraulicFractureCanvasLayer } from '../../common/entities/mapCanvas/layers/hydraulicFractureCanvasLayer';
import { InjWellsCanvasLayer } from '../../common/entities/mapCanvas/layers/injWellsCanvasLayer';
import { IsolineCanvasLayer } from '../../common/entities/mapCanvas/layers/isolineCanvasLayer';
import { OilWellsCanvasLayer } from '../../common/entities/mapCanvas/layers/oilWellsCanvasLayer';
import { ScaleGridPanelCanvasLayer } from '../../common/entities/mapCanvas/layers/scaleGridPanelCanvasLayer';
import { TrajectoryCanvasLayer } from '../../common/entities/mapCanvas/layers/trajectoryCanvasLayer';
import { WellDateEnum } from '../../common/entities/mapCanvas/wellDateLabel';
import { WellDetailedPoint } from '../../common/entities/mapCanvas/wellDetailedPoint';
import { InjWellPoint, isInj, isOil } from '../../common/entities/wellPoint';
import { FundTypeEnum } from '../../common/enums/fundTypeEnum';
import { GridMapEnum } from '../../common/enums/gridMapEnum';
import { inputPalette } from '../../common/helpers/map/palette';
import { mapDateLabels } from '../../input/store/map/mapDateLabels';
import { modeMapTypeState } from '../../input/store/map/modeMapType';
import { currentGridMap } from '../store/gridMap';
import { gridMapSettings } from '../store/gridMapSettings';
import { mapSettingsState } from '../store/mapSettings';
import { currentSpot } from '../store/well';
import { wellStockState } from '../store/wellStock';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ModuleMap = () => {
    const { t } = useTranslation();

    const gridMap = useRecoilValue(currentGridMap);
    const gridSettings = useRecoilValue(gridMapSettings);
    const mapSettings = useRecoilValue(mapSettingsState);
    const stock = useRecoilValue(wellStockState);
    const well = useRecoilValue(currentSpot);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const dateLabels = useRecoilValue(mapDateLabels);
    const plastId = useRecoilValue(currentPlastId);
    const contourEditMode = useRecoilValue(contourEditModeState);
    const togglePolygon = useRecoilValue(togglePolygonState);
    const changingPolygon = useRecoilValue(changingPolygonState);

    const [activeContourId, setActiveContourId] = useRecoilState(activeContourIdState);
    const [activeContour, setActiveContour] = useRecoilState(activeContourSelector);

    const setSelectedPolygon = useSetRecoilState(selectedPolygonState);

    if (!mapSettings?.points) {
        return null;
    }

    const onChangePolygonSelected = (polygon: number[][]) => {
        setSelectedPolygon(map(it => new Point(it[0], it[1]), polygon));
    };

    const scaleMeasure = (type: GridMapEnum): string =>
        cond([
            [
                x =>
                    includes(x, [
                        GridMapEnum.Power,
                        GridMapEnum.TopAbs,
                        GridMapEnum.BottomAbs,
                        GridMapEnum.CurrentPower
                    ]),
                always(t(dict.common.units.meter))
            ],
            [x => includes(x, [GridMapEnum.Porosity, GridMapEnum.OilSaturation]), always(t(dict.common.units.units))],
            [x => includes(x, [GridMapEnum.Permeability]), always('mD')],
            [x => includes(x, [GridMapEnum.PressureZab]), always(t(dict.common.units.atm))],
            [T, always('')]
        ])(type);

    const visibleActiveStockTrajectory = any(
        it => it.type === FundTypeEnum.ActiveStock && it.param === WellDateEnum.Trajectory && it.value,
        dateLabels
    );

    const visibleDrilledFoundationTrajectory = any(
        it => it.type === FundTypeEnum.DrilledFoundation && it.param === WellDateEnum.Trajectory && it.value,
        dateLabels
    );

    return (
        <MapCanvas
            key={`geo_map_${well.toString()}_${plastId}`}
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
                new ContourModificationCanvasLayer(
                    mapSettings.contour,
                    activeContourId,
                    setActiveContourId,
                    contourEditMode && !changingPolygon && !togglePolygon,
                    mapSettings.canvasSize
                ),
                new ContourCanvasLayer(
                    changingPolygon && activeContourId
                        ? reject((it: ContourModelBrief) => it.id === activeContourId, mapSettings.contour)
                        : mapSettings.contour,
                    mapSettings.canvasSize
                ),
                new ContourDragChangingCanvasLayer(
                    changingPolygon,
                    activeContourId,
                    activeContour,
                    setActiveContour,
                    mapSettings.canvasSize
                ),
                new OilWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isOil, mapSettings.points) as unknown as WellDetailedPoint[],
                    modeMapType,
                    false,
                    false
                ),
                new InjWellsCanvasLayer(
                    mapSettings.canvasSize,
                    filter(isInj, mapSettings.points) as Array<InjWellPoint>,
                    modeMapType,
                    false,
                    false
                ),
                new DrilledFoundationCanvasLayer(
                    includes(FundTypeEnum.DrilledFoundation, stock),
                    mapSettings.drilledFoundationPoints,
                    mapSettings.canvasSize
                ),
                new HydraulicFractureCanvasLayer(
                    filter(x => x.grpState > 0, mapSettings.points),
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
                    mapSettings.drilledFoundationPoints as any,
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
                )
            ]}
            points={mapSettings.points}
            activeWell={well.id}
            plastId={mapSettings.plastId}
            canvasSize={mapSettings.canvasSize}
            additionalPoints={gridSettings.grids}
            gridStepSize={gridSettings.stepSize}
            showZValue={gridMap !== GridMapEnum.None}
            togglePolygon={togglePolygon}
            onChangePolygonSelected={onChangePolygonSelected}
        />
    );
};
