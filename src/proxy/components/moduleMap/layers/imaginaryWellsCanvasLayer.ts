import * as d3 from 'd3';
import * as R from 'ramda';

import { isInj, isOil, isUnknown } from '..';
import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { wellRadius } from '../../../../common/entities/canvas/commonCanvas';
import { ContourModelBrief } from '../../../../common/entities/contourModelBrief';
import {
    BaseWellsCanvasLayer,
    CanvasWellPoint
} from '../../../../common/entities/mapCanvas/layers/baseWellsCanvasLayer';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { MapModel, InitMapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { WellDateLabel } from '../../../../common/entities/mapCanvas/wellDateLabel';
import { shallowEqual } from '../../../../common/helpers/compare';
import { distance } from '../../../../common/helpers/math';
import { isNullOrEmpty, mapIndexed } from '../../../../common/helpers/ramda';
import { ConnectionPoint, WellPoint } from '../../../entities/proxyMap/wellPoint';
import { OptimisationParamEnum } from '../../../enums/wellGrid/optimisationParam';
import { InjWellsCanvasLayer } from './injWellsCanvasLayer';
import { OilWellsCanvasLayer } from './oilWellsCanvasLayer';
import { UnknownWellsCanvasLayer } from './unknownWellsCanvasLayer';

const DEFAULT_MULTIPLIER_ID = 10;
const MIN_DISTANCE = 75;
const MAX_DISTANCE = 750;

const ContourTypeArray = [2, 3, 6, 7, 8, 9];

export class ImaginaryWellsCanvasLayer extends BaseWellsCanvasLayer implements MapLayer {
    private show: boolean;
    private wells: WellPoint[];
    private allWells: WellPoint[];
    private currentFund: WellPoint[];

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private optimisation: any[];
    private optimisationType: OptimisationParamEnum;
    private contour: ContourModelBrief[];
    private horizontalBarrel: number;
    private allowDrag: boolean;
    private dateLabels: WellDateLabel[];
    private changeWellPosition: (point: WellPoint) => void;

    private oilWellsLayer: OilWellsCanvasLayer;
    private injWellsLayer: InjWellsCanvasLayer;
    private unknownWellsLayer: UnknownWellsCanvasLayer;

    private dragCursor: number[];

    // TODO: проверить типы, возможно неверная типизация
    private spiderContours: ConnectionPoint[][];
    private spiderPoints: number[][];
    private horizontalBarrelPoints: number[];

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private updateHandler: any;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private selection: any;

    public constructor(
        show: boolean,
        wells: WellPoint[],
        allWells: WellPoint[],
        currentFund: WellPoint[],
        // TODO: типизация
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        optimisation: any,
        optimisationType: OptimisationParamEnum,
        contour: ContourModelBrief[],
        horizontalBarrel: number,
        allowDrag: boolean,
        dateLabels: WellDateLabel[],
        changeWellPosition: (point: WellPoint) => void,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.show = show;
        this.wells = wells;
        this.allWells = allWells;
        this.currentFund = currentFund;
        this.optimisation = optimisation;
        this.optimisationType = optimisationType;
        this.contour = contour;
        this.horizontalBarrel = horizontalBarrel;
        this.allowDrag = allowDrag;
        this.dateLabels = dateLabels;
        this.changeWellPosition = changeWellPosition;
    }

    public equals(other: ImaginaryWellsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.allWells, other.allWells) &&
            shallowEqual(this.currentFund, other.currentFund) &&
            shallowEqual(this.optimisation, other.optimisation) &&
            shallowEqual(this.optimisationType, other.optimisationType) &&
            shallowEqual(this.contour, other.contour) &&
            shallowEqual(this.horizontalBarrel, other.horizontalBarrel) &&
            shallowEqual(this.allowDrag, other.allowDrag) &&
            shallowEqual(this.dateLabels, other.dateLabels) &&
            shallowEqual(this.changeWellPosition, other.changeWellPosition)
        );
    }

    public initLayer = (model?: InitMapModel): void => {
        if (!this.show) {
            return;
        }

        this.setCanvasScale(model?.scale);

        const imgAndCurFund = R.flatten([this.wells, this.currentFund]);

        this.oilWellsLayer = new OilWellsCanvasLayer(
            R.filter(isOil, imgAndCurFund),
            this.dateLabels,
            this.canvasSize,
            this.optimisationType,
            this.optimisation
        );
        this.injWellsLayer = new InjWellsCanvasLayer(
            R.filter(isInj, imgAndCurFund),
            this.dateLabels,
            this.canvasSize,
            this.optimisationType,
            this.optimisation
        );

        this.unknownWellsLayer = new UnknownWellsCanvasLayer(
            R.filter(isUnknown, imgAndCurFund),
            this.canvasSize,
            this.optimisationType,
            this.optimisation
        );

        this.oilWellsLayer.initLayer(model);
        this.injWellsLayer.initLayer(model);
        this.unknownWellsLayer.initLayer(model);

        this.dragCursor = [];

        this.initHorizontalBarrel();
        this.initSpiderPoints();

        this.updateHandler = model.update ?? this.updateHandler;
        this.selection = model.selection ?? this.selection;

        if (this.allowDrag) {
            const drag = this.drag(this.selection);
            if (drag) {
                this.selection?.call(drag.on('start.render drag.render end.render', this.update));
            }

            model.initZoomBehavior();
        } else {
            this.selection?.on('.drag', null);
        }
    };

    private initSpiderPoints = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.spiderContours = R.pipe(
            R.filter((it: ContourModelBrief) => R.indexOf(it.type, ContourTypeArray) >= 0),
            mapIndexed((it: ContourModelBrief, index: number) =>
                R.map(x => new ConnectionPoint(it.type * DEFAULT_MULTIPLIER_ID * index, x[0], x[1]), it.points)
            ),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            R.flatten,
            R.groupBy(x => x.id.toString()),
            R.values
        )(this.contour);

        this.spiderPoints = R.map(it => [it.x, it.y, it.id], this.allWells);
    };

    private update = () => {
        requestAnimationFrame(this.updateHandler);
    };

    public render = (model: MapModel): void => {
        if (!this.show) {
            return;
        }

        this.renderHorizontalBarrel(model);
        this.spider(model);

        this.oilWellsLayer.render(model);
        this.injWellsLayer.render(model);
        this.unknownWellsLayer.render(model);
    };

    private initHorizontalBarrel = () => {
        // todo mb
    };

    private renderHorizontalBarrel = (model: MapModel) => {
        if (!this.horizontalBarrel) {
            return;
        }

        let well = R.find(it => it.id === this.horizontalBarrel, R.flatten([this.wells, this.currentFund]));

        if (well && !isNullOrEmpty(model.cursorPoint)) {
            this.horizontalBarrelPoints = [
                this.cx(well.x),
                this.cy(well.y),
                this.cx(model.cursorPoint[0]),
                this.cy(model.cursorPoint[1]),
                distance(well.x, well.y, model.cursorPoint[0], model.cursorPoint[1])
            ];
        }

        if (isNullOrEmpty(this.horizontalBarrelPoints)) {
            return;
        }

        const p = this.horizontalBarrelPoints;

        const [x1, y1] = model.transform.apply([p[0], p[1]]);
        const [x2, y2] = model.transform.apply([p[2], p[3]]);

        model.context.save();

        model.context.beginPath();
        model.context.strokeStyle = 'red';
        model.context.arc(x2, y2, 3, 0, 2 * Math.PI);
        model.context.closePath();
        model.context.stroke();

        model.context.beginPath();
        model.context.lineWidth = 1;
        model.context.strokeStyle = 'black';
        model.context.setLineDash([5, 5]);
        model.context.moveTo(x1, y1);
        model.context.lineTo(x2, y2);
        model.context.closePath();
        model.context.stroke();

        model.context.fillStyle = 'gray';
        model.context.font = '12px Inter';
        model.context.fillText(`${p[4].toString()}м`, (x2 + x1) / 2, (y2 + y1) / 2);

        model.context.restore();
    };

    private drag = selection => {
        if (!this.allowDrag) {
            return null;
        }

        const dragsubject = () => {
            const transform = d3.zoomTransform(selection.node());

            let item = R.find(
                (it: CanvasWellPoint) =>
                    distance(transform.invertX(d3.event.x), transform.invertY(d3.event.y), it.x, it.y) <
                    wellRadius + this.zoomFactor(transform.k) / 10,
                R.flatten([this.oilWellsLayer.points, this.injWellsLayer.points, this.unknownWellsLayer.points])
            );

            if (item) {
                item.x = transform.applyX(item.x);
                item.y = transform.applyY(item.y);
            }

            return item;
        };

        const dragstarted = () => {
            const transform = d3.zoomTransform(selection.node());

            d3.event.subject.x = transform.invertX(d3.event.x);
            d3.event.subject.y = transform.invertY(d3.event.y);

            this.dragCursor = null;
        };

        const dragged = () => {
            const transform = d3.zoomTransform(selection.node());

            d3.event.subject.x = transform.invertX(d3.event.x);
            d3.event.subject.y = transform.invertY(d3.event.y);

            this.dragCursor = [this.invertX(d3.event.subject.x), this.invertY(d3.event.subject.y), d3.event.subject.id];
        };

        const dragended = () => {
            this.updatedWellPosition(this.dragCursor);

            this.dragCursor = null;
        };

        return d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    private spider = (model: MapModel) => {
        if (isNullOrEmpty(this.dragCursor)) {
            return;
        }

        // TODO: типизация
        /* eslint-disable @typescript-eslint/no-explicit-any */
        let groupFilter = (value: any) =>
            R.pipe<ConnectionPoint[][], any[], ConnectionPoint[], ConnectionPoint[], ConnectionPoint[]>(
                R.map(
                    (it: any) =>
                        new ConnectionPoint(
                            it.id,
                            it.x,
                            it.y,
                            distance(this.dragCursor[0], this.dragCursor[1], it.x, it.y)
                        )
                ),
                R.filter<ConnectionPoint>(it => it.d < MAX_DISTANCE && it.d > MIN_DISTANCE),
                R.sortBy(x => x.d),
                R.take(1)
            )(value);

        const contourPoints = R.pipe(R.mapObjIndexed(groupFilter), R.values, R.reject(R.isEmpty))(this.spiderContours);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        let points = R.pipe(
            R.filter(it => this.dragCursor[2] !== it[2]),
            R.map(
                it =>
                    new ConnectionPoint(
                        it[2],
                        it[0],
                        it[1],
                        distance(this.dragCursor[0], this.dragCursor[1], it[0], it[1])
                    )
            ),
            R.filter<ConnectionPoint>(it => it.d < MAX_DISTANCE && it.d > MIN_DISTANCE),
            R.sortBy(x => x.d),
            x => R.take(5, x)
        )(this.spiderPoints);

        const concatedPoints = R.pipe(
            R.sortBy((x: ConnectionPoint) => x.d),
            x => R.take(6, x)
        )(R.flatten([contourPoints, points]));

        model.context.save();

        for (const d of concatedPoints) {
            const [x1, y1] = model.transform.apply([this.cx(this.dragCursor[0]), this.cy(this.dragCursor[1])]);
            const [x2, y2] = model.transform.apply([this.cx(d.x), this.cy(d.y)]);
            model.context.beginPath();
            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);
            model.context.lineWidth = 1;
            model.context.strokeStyle = 'rgb(254, 130, 130)';
            model.context.setLineDash([3, 3]);
            model.context.closePath();
            model.context.stroke();

            model.context.save();
            model.context.translate((x2 + x1) / 2, (y2 + y1) / 2);
            model.context.textAlign = 'center';
            model.context.fillStyle = 'gray';
            model.context.font = '12px Inter';
            model.context.fillText(`${d.d}м`, 0, -10);
            model.context.restore();
        }

        model.context.restore();
    };

    private updatedWellPosition(p: number[]) {
        if (isNullOrEmpty(p)) {
            return;
        }

        let newX = Math.round(p[0]);
        let newY = Math.round(p[1]);
        let id = p[2];
        let point = R.find(it => it.id === id, R.flatten([this.wells, this.currentFund])) as WellPoint;

        let horizontalX = null;
        let horizontalY = null;
        if (point.x2 && point.y2) {
            horizontalX = point.x2;
            horizontalY = point.y2;
        }

        this.changeWellPosition(
            new WellPoint(
                id,
                newX,
                newY,
                horizontalX,
                horizontalY,
                point.name,
                point.plastId,
                point.typeHistory,
                point.isImaginary,
                point.isIntermediate,
                point.isDrilledFoundation,
                point.trajectories,
                point.plastNames
            )
        );
    }
}
