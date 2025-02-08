// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as d3 from 'd3';
import inside from 'point-in-polygon';
import * as R from 'ramda';
import { filter, find, head, includes, sortBy } from 'ramda';

import { WellPoint } from '../../entities/wellPoint';
import { MapSelectionType } from '../../enums/mapSelectionType';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { saveCanvas } from '../../helpers/canvas';
import { distance, round100, round0 } from '../../helpers/math';
import { isNullOrEmpty, isFn } from '../../helpers/ramda';
import { CanvasSize } from '../canvas/canvasSize';
import { CommonCanvas } from '../canvas/commonCanvas';
import { MapLayer } from './layers/mapLayer';
import { PolygonCanvasLayer } from './layers/polygonCanvasLayer';
import { MapModel } from './mapModel';

const minScale = 0.1;
const maxScale = 10.5;

const initialZoomStep = 1.3;
const durationTime = 300;

const mouseMoveDelay = 10;

const defaultWellDistance = 70;
const defaultFont = '10px Inter';

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

export class BaseMap extends CommonCanvas {
    private width: number;
    private height: number;
    private layers: MapLayer[];
    private points: ReadonlyArray<WellPoint>;
    private activeWell?: number;
    private activeContourId?: number;
    private plastId?: number;
    private productionObjectId?: number;
    private additionalPoints: number[][];
    private gridStepSize: number;
    private showZValue: boolean;
    private scale: number;
    private disableDragAndDrop: boolean;

    public onCursorPointMove: (p: number[]) => void;
    public onSelectWell: (id: number, type: WellTypeEnum, pos: number[]) => void;
    public multipleWellsSelected?(wells: WellPoint[], selectionType: MapSelectionType): void;
    public onChangePolygonSelected?(polygon: number[][], selectionType: MapSelectionType): void;
    public onClick?(point: number[]): void;
    public onDoubleClick?(point: number[]): void;

    private polygonLayer: PolygonCanvasLayer;

    private selection: any;
    private zoom: any;
    private canvas: any;
    private ctx: any;
    private canvasMinimap: any;
    private ctxMinimap: any;

    private minimap: any;
    private minimapBrush: any;
    private minimapBrushNode: any;

    private lastPoint: number[];
    private cursorPoint: number[];
    private polygon: number[][];
    private polygonFinished: boolean;
    private selectedWells: WellPoint[];
    private selectedPoints: number[][];
    private selectionType: MapSelectionType;
    private togglePolygon: boolean;

    private mouseMoveQueue: number[][];
    private wellCursorPoints: number[][];

    public constructor(
        canvasSize: CanvasSize,
        width: number,
        height: number,
        layers: MapLayer[],
        points: WellPoint[],
        activeWell: number,
        additionalPoints: number[][],
        gridStepSize: number,
        showZValue: boolean,
        scale: number,
        disableDragAndDrop: boolean
    ) {
        super(canvasSize);

        this.canvasSize = canvasSize;
        this.width = width;
        this.height = height;
        this.layers = layers;
        this.points = points;
        this.activeWell = activeWell;
        this.additionalPoints = additionalPoints;
        this.gridStepSize = gridStepSize;
        this.showZValue = showZValue;
        this.scale = scale;
        this.disableDragAndDrop = disableDragAndDrop;

        this.polygonLayer = new PolygonCanvasLayer(false, canvasSize);

        this.cursorPoint = [];
        this.lastPoint = [];
        this.polygon = [];
        this.polygonFinished = false;
        this.selectedWells = [];
        this.selectedPoints = [];
        this.selectionType = MapSelectionType.Contour;
        this.togglePolygon = false;

        this.mouseMoveQueue = [];

        this.wellCursorPoints = R.map(it => [it.x, it.y], this.points);
    }

    public getLastPoint = (): number[] => this.lastPoint;

    public getMinScale = (): number => minScale / this.scale;

    public getMaxScale = (): number => maxScale / this.scale;

    public setLayers = (layers: MapLayer[]): void => {
        this.layers = layers;
    };

    public setLayerByIndex = (index: number, layer: MapLayer): void => {
        this.layers[index] = layer;
        this.callInitLayer(this.layers[index].initLayer);
    };

    public setViewBox = (width: number, height: number): void => {
        this.width = width;
        this.height = height;

        this.update();
    };

    public setPoints = (points: ReadonlyArray<WellPoint>): void => {
        this.points = points;

        this.wellCursorPoints = R.map(it => [it.x, it.y], this.points);

        this.update();
        this.updateMinimap();
    };

    public setShowZValues = (data: number[][], size: number, showZ: boolean): void => {
        this.additionalPoints = data;
        this.gridStepSize = size;
        this.showZValue = showZ;

        this.update();
    };

    public setDisableDragAndDrop = (value: boolean): void => {
        this.disableDragAndDrop = value;

        this.update();
    };

    public setTogglePolygon = (value: boolean): void => {
        this.togglePolygon = value;

        if (!value) {
            this.clearPolygon();
        }

        this.initZoomBehavior();

        this.update();
    };

    public setCanvasSize = (cs: CanvasSize): void => {
        this.canvasSize = cs;

        this.update();
        this.updateMinimap();
    };

    public setSelectionType = (selectionType: MapSelectionType): void => {
        this.selectionType = selectionType;
        this.polygonLayer.setSelectionType(selectionType);

        this.update();
        this.updateMinimap();
    };

    public setActiveWell = (well: number): void => {
        this.activeWell = well;

        if (well !== null) {
            this.initialPosition();
        }

        this.update();
    };

    public setPlast = (id?: number): void => {
        this.plastId = id;

        this.initialPosition();
        this.update();
        this.updateMinimap();
    };

    public setProductionObject = (id?: number): void => {
        this.productionObjectId = id;

        this.initialPosition();
        this.update();
        this.updateMinimap();
    };

    public init = (): void => {
        this.canvas = d3.select('#canvasMap').node();
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = defaultFont;
        this.selection = d3.select(this.ctx.canvas);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.zoom = d3
            .zoom()
            .scaleExtent([this.getMinScale(), this.getMaxScale()])
            .on('zoom', () => this.zoomed(this.canvas, this.ctx, d3.event.transform));

        this.initLayers();
        this.initZoomBehavior();
        this.initialPosition();
        this.initMinimap();

        this.update();
    };

    public updateChangedLayers = current => {
        const prev = this.layers;

        if (current.length !== prev.length) {
            return;
        }

        for (let i = 0; i < current.length; i++) {
            if (isFn(current[i].equals) && !current[i].equals(prev[i])) {
                this.setLayerByIndex(i, current[i]);
            }
        }

        this.update();
        this.updateMinimap();
    };

    private initialObjectTransform = () => {
        const [x0, y0, x1, y1] = [
            this.cx(this.canvasSize.xMin),
            this.cy(this.canvasSize.yMin),
            this.cx(this.canvasSize.xMax),
            this.cy(this.canvasSize.yMax)
        ];

        const [width, height] = this.minimapProps();
        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(this.getMaxScale(), 0.975 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    };

    private initialExportTransform = (width: number, height: number) => {
        const [x0, y0, x1, y1] = [
            this.cx(this.canvasSize.xMin),
            this.cy(this.canvasSize.yMin),
            this.cx(this.canvasSize.xMax),
            this.cy(this.canvasSize.yMax)
        ];

        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(this.getMaxScale(), 1 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    };

    private initMinimap = () => {
        const [width, height] = this.minimapProps();

        this.canvasMinimap = d3.select('#minimapCanvas') as any;
        this.ctxMinimap = this.canvasMinimap.node().getContext('2d');

        this.updateMinimap();

        d3.select('#minimap').select('svg').remove();

        this.minimap = d3
            .select('#minimap')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${this.cWidth()} ${this.cHeight()}`);

        const brushed = () => {
            if (!d3.event.sourceEvent) {
                return;
            }

            this.zoom.translateTo(
                this.selection,
                (d3.event.selection[0][0] + d3.event.selection[1][0]) / 2,
                (d3.event.selection[0][1] + d3.event.selection[1][1]) / 2
            );
        };

        this.minimapBrush = d3
            .brush()
            .filter(
                () =>
                    !d3.event.ctrlKey &&
                    !d3.event.button &&
                    (d3.event.metaKey || d3.event.target.__data__.type !== 'overlay')
            )
            .on('brush', brushed);

        this.minimap.select('g').remove();

        this.minimapBrushNode = this.minimap.append('g').attr('class', 'brush').call(this.minimapBrush);

        this.updateBrushPosition();
    };

    private updateBrushPosition = () => {
        const transform = this.currentZoomTransform();
        const ext = d3.zoomIdentity.scale(1 / transform.k).translate(-transform.x, -transform.y);
        this.minimapBrushNode.call(this.minimapBrush.move, [
            [ext.x, ext.y],
            [ext.x + this.width * ext.k, ext.y + this.height * ext.k]
        ]);
    };

    public filter(): boolean {
        return !this.polygonFinished;
    }

    public initLayers = (): void => {
        R.forEach(it => this.callInitLayer(it.initLayer), this.layers);
        this.initZoomBehavior();
        this.update();
    };

    private callInitLayer = fn => {
        isFn(fn) &&
            fn({
                scale: this.scale,
                selection: this.selection,
                update: this.update,
                initZoomBehavior: this.initZoomBehavior
            });
    };

    private callOnClickLayer = fn => {
        if (!isFn(fn)) {
            return;
        }

        const transform = this.currentZoomTransform();
        const coords = d3.mouse(this.ctx.canvas);
        const p = this.invertPoint(transform.invert(coords));

        fn(p);
    };

    public initZoomBehavior = (): void => {
        this.selection
            ?.call(this.zoom)
            .on('click.zoom', this.onClickZoom.bind(this))
            .on('dblclick.zoom', this.onDblClickZoom.bind(this))
            .on('mousemove.zoom', this.onMouseMoveZoom.bind(this));

        if (this.togglePolygon) {
            this.selection
                .call(this.zoom)
                .on('dblclick.zoom', this.onDblClickZoom.bind(this))
                .on('mousedown.zoom', null);
        }
    };

    public initialPosition = (): void => {
        if (!this.selection || !this.zoom) {
            return;
        }

        const wellPoint = this.actualWell();

        if (wellPoint) {
            this.zoom.translateTo(this.selection, wellPoint[0], wellPoint[1]);
            this.zoom.scaleTo(this.selection, this.getMaxScale());
        } else {
            const delta = R.max(this.cWidth(), this.cHeight());
            const scale = this.getMaxScale() - ((this.getMaxScale() - this.getMinScale()) * delta) / 1000;
            this.zoom.translateTo(this.selection, this.cCenterX(), this.cCenterY());
            this.zoom.scaleTo(this.selection, scale);
        }
    };

    public update = (): void => {
        this.zoomed(this.canvas, this.ctx, this.currentZoomTransform());
    };

    public updateMinimap = (): void => {
        this.zoomed(this.canvasMinimap, this.ctxMinimap, this.initialObjectTransform(), true);
    };

    public clearPolygon = (): void => {
        if (isNullOrEmpty(this.polygon)) {
            return;
        }

        this.polygon = [];
        this.selectedWells = [];
        this.selectedPoints = [];
        this.polygonFinished = false;
        this.lastPoint = [];
        this.multipleWellsSelected([], this.selectionType);
        this.onChangePolygonSelected([], this.selectionType);

        this.update();
    };

    public connectPolygon = (): void => {
        const newPolygon = this.polygon;
        if (newPolygon.length > 1) {
            let wells = [];
            if (
                this.selectionType === MapSelectionType.Contour ||
                this.selectionType === MapSelectionType.ContourOptional
            ) {
                newPolygon.push(newPolygon[0]);
                wells = R.filter(
                    (it: WellPoint) =>
                        inside(
                            [this.cx(it.x), this.cy(it.y)],
                            R.map(n => [n[0], n[1]], newPolygon)
                        ),
                    this.points as WellPoint[]
                );
            } else if (this.selectionType === MapSelectionType.Profile) {
                R.forEach(it => {
                    const well = R.find(w => distance(it[0], it[1], this.cx(w.x), this.cy(w.y)) < 3, this.points);
                    if (well) {
                        wells.push(well);
                    }
                }, newPolygon);
            } else if (this.selectionType === MapSelectionType.Reserves) {
                newPolygon.push(newPolygon[0]);
            }

            this.polygon = newPolygon;
            this.selectedWells = wells;
            this.selectedPoints = R.map(it => [this.cx(it.x), this.cy(it.y)], wells);
            this.polygonFinished = true;
            this.lastPoint = [];
            this.multipleWellsSelected(wells, this.selectionType);
            this.onChangePolygonSelected(
                R.map(it => this.invertPoint(it), newPolygon),
                this.selectionType
            );
        }

        this.update();
    };

    public zoomIn = (): void => this.zoom.scaleBy(this.selection.transition().duration(durationTime), initialZoomStep);
    public zoomOut = (): void =>
        this.zoom.scaleBy(this.selection.transition().duration(durationTime), 1 / initialZoomStep);

    public exportFile = (): void => {
        const canvas = d3.select('#exportCanvas') as any;
        const ctx = canvas.node().getContext('2d');

        const [width, height] = [
            Math.abs(this.canvasSize.xMax - this.canvasSize.xMin) / 3 / this.scale,
            Math.abs(this.canvasSize.yMax - this.canvasSize.yMin) / 3 / this.scale
        ];

        canvas.attr('width', width).attr('height', height);

        this.zoomed(canvas, ctx, this.initialExportTransform(width, height), false, true);

        saveCanvas(canvas.node());
    };

    public searchWell = (value?: string): void => {
        if (isNullOrEmpty(value)) {
            return;
        }

        const item = find(it => includes(value, it.name), this.points);

        if (item) {
            this.setActiveWell(item.id);

            this.initialPosition();
            this.update();
        }
    };

    public setScale = (value: number): void => {
        this.scale = value;

        this.initZoomBehavior();
        this.initLayers();

        this.update();
    };

    private currentZoomTransform = () => d3.zoomTransform(this.canvas);

    private zoomed = (canvas, context, transform, isMinimap: boolean = false, isExport: boolean = false) => {
        const renderLayer = () => {
            canvas.width = this.width;
            canvas.height = this.height;

            context.save();
            context.clearRect(0, 0, this.width, this.height);

            const model: MapModel = {
                context: context,
                transform: transform,
                canvasSize: this.canvasSize,
                width: this.width,
                height: this.height,
                cursorPoint: this.cursorPoint,
                isMinimap: isMinimap,
                isExport: isExport
            };

            R.forEach(it => it.render(model), this.layers);

            this.polygonLayer.render(
                model,
                this.polygon,
                [this.cx(this.cursorPoint[0]), this.cy(this.cursorPoint[1])],
                this.selectedPoints,
                this.polygonFinished
            );

            context.restore();

            this.updateBrushPosition();
        };

        requestAnimationFrame(renderLayer);
    };

    private actualWell = () => {
        if (this.activeWell) {
            const wellPoint = R.find(x => +x.id === +this.activeWell, this.points);
            return wellPoint ? [this.cx(wellPoint.x), this.cy(wellPoint.y)] : null;
        }

        return null;
    };

    private onClickZoom = () => {
        const transform = this.currentZoomTransform();
        const coords = d3.mouse(this.ctx.canvas);
        const point = transform.invert(coords);
        const p = this.invertPoint(transform.invert(coords));

        if ((d3.event.ctrlKey || d3.event.metaKey || this.togglePolygon) && !this.polygonFinished) {
            this.polygon.push(point);
            this.lastPoint = this.invertPoint(point);

            this.update();
        } else {
            if (this.points) {
                const wells = filter(it => distance(it.x, it.y, p[0], p[1]) < defaultWellDistance, this.points);

                let well = head(wells ?? []);

                if (wells.length > 1) {
                    well = head(sortBy(it => distance(it.x, it.y, p[0], p[1]), wells));
                }

                if (well && well.type) {
                    const wellCoords = transform.apply([this.cx(well.x), this.cy(well.y)]);
                    this.onSelectWell(well.id, well.type, [p[0], p[1], wellCoords[0], wellCoords[1]]);
                }
            }
        }

        this.onClick([p[0], p[1], coords[0], coords[1]]);

        R.forEach(it => this.callOnClickLayer(it.onClick), this.layers);
    };

    private onDblClickZoom = () => {
        if (this.polygonFinished) {
            this.clearPolygon();
        } else {
            this.connectPolygon();
        }

        if (!this.togglePolygon && isFn(this.onDoubleClick)) {
            const transform = this.currentZoomTransform();
            const coords = d3.mouse(this.ctx.canvas);
            const p = this.invertPoint(transform.invert(coords));

            this.onDoubleClick([p[0], p[1], coords[0], coords[1]]);
        }

        R.forEach(it => this.callOnClickLayer(it.onDoubleClick), this.layers);
    };

    private onMouseMoveZoom = () => {
        const coords = d3.mouse(this.ctx.canvas);

        this.handleMouseMove(coords);

        this.setCursorPointer(coords);
    };

    private setCursorPointer = coords => {
        const point = this.currentZoomTransform().invert(coords);
        const real = this.invertPoint(point);

        const item = R.find(
            it => distance(it[0], it[1], real[0], real[1]) < defaultWellDistance,
            this.wellCursorPoints
        );

        this.canvas.style.cursor = item ? 'pointer' : 'auto';
    };

    private callMouseMoved = coords => {
        const mouseMoved = () => {
            const point = this.currentZoomTransform().invert(coords);
            const real = this.invertPoint(point);

            let z = 0;

            if (this.showZValue && !isNullOrEmpty(this.additionalPoints)) {
                const x = round0((real[0] - this.canvasSize.xMin) / this.gridStepSize);
                const y = round0(Math.abs(real[1] - this.canvasSize.yMax) / this.gridStepSize);

                const zValue =
                    x >= 0 && x < this.additionalPoints.length && y >= 0 && y < this.additionalPoints[0].length
                        ? this.additionalPoints[x][y]
                        : null;

                z = zValue ? round100(zValue) : 0;
            }

            this.cursorPoint = [real[0], real[1], z, coords[0], coords[1]];

            this.onCursorPointMove(this.cursorPoint);

            if (!isNullOrEmpty(this.polygon) && !this.polygonFinished) {
                this.update();
            }

            if (this.disableDragAndDrop) {
                this.update();
            }
        };

        requestAnimationFrame(mouseMoved);
    };

    private handleMouseMove(value) {
        if (isNullOrEmpty(this.polygon)) {
            this.mouseMoveQueue.push(value);
            setTimeout(this.triggerMouseMove.bind(this), mouseMoveDelay);
        } else {
            this.callMouseMoved(value);
        }
    }

    private triggerMouseMove() {
        if (this.mouseMoveQueue.length === 1) {
            const val = this.mouseMoveQueue.shift();
            this.callMouseMoved(val);
        } else {
            this.mouseMoveQueue.shift();
        }
    }
}
