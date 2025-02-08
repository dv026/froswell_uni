// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    CANVAS_TABLET_ELEMENT,
    EXPORT_TABLET_CANVAS_ELEMENT,
    MINIMAP_TABLET_CANVAS_ELEMENT,
    MINIMAP_TABLET_ELEMENT
} from 'common/components/tabletCanvas/tabletCanvas';
import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import * as d3 from 'd3';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';
import { getColumns } from 'input/entities/tabletSettingsModel';
import { ascBy, getExtremumByObject } from 'input/helpers/tabletHelper';
import * as R from 'ramda';
import { filter, find, forEach, includes, map, sum } from 'ramda';

import { saveCanvas } from '../../helpers/canvas';
import { distance } from '../../helpers/math';
import { isFn, mapIndexed, shallow } from '../../helpers/ramda';
import { CanvasSize } from '../canvas/canvasSize';
import { LithologyType } from '../lithologyType';
import { WellBrief } from '../wellBrief';
import { CommonCanvasTablet } from './commonCanvasTablet';
import { getAbsDepth } from './helpers/canvasSize';
import { TabletLayer } from './tabletLayer';
import { TabletModel } from './tabletModel';

const minScale = 0.05;
const defaultScale = 0.75;
const maxScale = 1.5;

const initialZoomStep = 1.3;
const durationTime = 300;

const mouseMoveDelay = 10;

const defaultWellDistance = 70;
const defaultFont = '10px Inter';

export const DEFAULT_MULTIPLE_PADDING = 200;

export interface ModelPictures {
    imgPlus?: HTMLImageElement;
    imgMinus?: HTMLImageElement;
    imgFilter?: HTMLImageElement;
    imgFilterTiny?: HTMLImageElement;
    imgPipeInjection?: HTMLImageElement;
    imgFilterBackground?: HTMLImageElement;
    imgBehindPipeInjection?: HTMLImageElement;
    imgESP?: HTMLImageElement;
    imgSPR?: HTMLImageElement;
    imgDiagonalHatchRed?: HTMLImageElement;
    lithology?: HTMLImageElement[];
    well?: HTMLImageElement[];
}

interface WellLayer {
    layers: TabletLayer[];
    model: TabletDataModel;
    previousModel: TabletDataModel;
    well: WellBrief;
    canvasSize: CanvasSize;
    absTop: number;
    absBottom: number;
    scaleY: ScaleLinear<number, number, never>;
    trajectoryScale: ScaleLinear<number, number, never>;
    columns: TabletColumn[];
    images?: ModelPictures;
}

export class BaseTablet extends CommonCanvasTablet {
    private width: number;
    private height: number;
    private layers: TabletLayer[];
    private model: TabletDataModel;
    private settings: TabletSettingsModel;
    private selectedWells: WellBrief[];
    private prodObjId: number;

    public onCursorPointMove: (p: number[]) => void;
    public onClick?(point: number[]): void;

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
    private togglePolygon: boolean;

    private scaleY: ScaleLinear<number, number, never>;
    private trajectoryScale: ScaleLinear<number, number, never>;

    private mouseMoveQueue: number[][];
    private wellCursorPoints: number[][];

    private wellLayers: WellLayer[];

    private images: ModelPictures;

    private tooltipData: string;

    public constructor(
        canvasSize: CanvasSize,
        width: number,
        height: number,
        layers: TabletLayer[],
        model: TabletDataModel,
        settings: TabletSettingsModel,
        selectedWells: WellBrief[],
        prodObjId: number
    ) {
        super(canvasSize);

        this.canvasSize = canvasSize;
        this.width = width;
        this.height = height;
        this.layers = layers;
        this.model = model;
        this.settings = settings;
        this.selectedWells = selectedWells;
        this.prodObjId = prodObjId;

        this.cursorPoint = [];
        this.lastPoint = [];

        this.mouseMoveQueue = [];
    }

    public getLastPoint = (): number[] => this.lastPoint;

    public getTrajectoryScale = () => this.trajectoryScale;

    public getScaleY = () => this.scaleY;

    public getTooltipData = () => this.tooltipData;

    public setLayerByIndex = (index: number, layer: TabletLayer): void => {
        this.wellLayers.forEach((obj: WellLayer) => {
            obj.layers[index] = layer;
            this.callInitLayer(obj.layers[index].initLayer, obj);
        });
    };

    public setViewBox = (width: number, height: number): void => {
        this.width = width;
        this.height = height;

        this.update();
    };

    public setModel = (model: TabletDataModel): void => {
        this.model = model;

        this.update();
    };

    public setSettings = (settings: TabletSettingsModel): void => {
        this.settings = settings;

        this.initLayers();

        this.update();
    };

    public setCanvasSize = (cs: CanvasSize): void => {
        this.canvasSize = cs;

        // this.initWellLayers();
        // this.initScales();
        // this.initMinimap();
        // this.initialPosition();

        this.update();
    };

    public init = (): void => {
        this.canvas = d3.select(`#${CANVAS_TABLET_ELEMENT}`).node();
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = defaultFont;
        this.selection = d3.select(this.ctx.canvas);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.zoom = d3
            .zoom()
            .scaleExtent([minScale, maxScale])
            .on('zoom', () => this.zoomed(this.canvas, this.ctx, d3.event.transform));

        this.initWellLayers();
        this.initImages();
        this.initScales();
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

    private initialExportTransform = (width: number, height: number) => {
        let xMin = this.canvasSize.xMin;
        let xMax = this.canvasSize.xMax;
        let yMin = this.canvasSize.yMin;
        let yMax = this.canvasSize.yMax;

        this.wellLayers.forEach((obj: WellLayer) => {
            xMin = Math.min(xMin, obj.canvasSize.xMin);
            xMax = Math.max(xMax, obj.canvasSize.xMax);
            yMin = Math.min(yMin, obj.canvasSize.yMin);
            yMax = Math.max(yMax, obj.canvasSize.yMax);
        });

        const [x0, y0, x1, y1] = [this.cx(xMin), this.cy(yMin), this.cx(xMax), this.cy(yMax)];

        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(maxScale, 1 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    };

    private initialMinimapPosition = () => {
        const [x0, y0, x1, y1] = [
            this.cx(this.canvasSize.xMin),
            this.cy(this.canvasSize.yMin),
            this.cx(this.canvasSize.xMax),
            this.cy(this.canvasSize.yMax)
        ];

        const [width, height] = this.minimapProps();
        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(maxScale, 0.975 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    };

    private initMinimap = () => {
        const [width, height] = this.minimapProps();

        this.canvasMinimap = d3.select(`#${MINIMAP_TABLET_CANVAS_ELEMENT}`) as any;
        this.ctxMinimap = this.canvasMinimap.node().getContext('2d');

        this.updateMinimap();

        d3.select(`#${MINIMAP_TABLET_ELEMENT}`).select('svg').remove();

        this.minimap = d3
            .select(`#${MINIMAP_TABLET_ELEMENT}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${this.cWidth()} ${this.cHeight()}`);

        const brushed = () => {
            if (!d3.event.sourceEvent) {
                return;
            }

            const transform = this.currentZoomTransform();
            const ext = d3.zoomIdentity.scale(1 / transform.k).translate(-transform.x, -transform.y);

            this.zoom.translateTo(
                this.selection,
                Math.abs(this.canvasSize.xMax - this.canvasSize.xMin) / 2,
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

    public initScales = (): void => {
        this.scaleY = scaleLinear()
            .domain(getAbsDepth(this.model, this.settings.scale))
            .range([this.canvasSize.yMin, this.canvasSize.yMax]);

        this.trajectoryScale = scaleLinear()
            .domain(map(it => it.zAbs, this.model.trajectories))
            .range(map(it => it.z, this.model.trajectories));
    };

    public initLayers = (): void => {
        this.callInitLayers();
        this.initZoomBehavior();
        this.update();
    };

    private callInitLayers = () => {
        this.wellLayers.forEach((obj: WellLayer) => {
            forEach(it => this.callInitLayer(it.initLayer, obj), obj.layers);
        });

        // forEach(it => this.callInitLayer(it.initLayer, this.canvasSize, this.model), this.layers);
    };

    private callInitLayer = (fn, settings: WellLayer) => {
        isFn(fn) &&
            fn({
                canvasSize: settings.canvasSize,
                absTop: settings.absTop,
                absBottom: settings.absBottom,
                model: settings.model,
                previousModel: settings.previousModel,
                well: settings.well,
                settings: this.settings,
                columns: filter(it => !includes(it.index, this.settings.hiddenColumns), settings.columns),
                selection: this.selection,
                scaleY: settings.scaleY,
                trajectoryScale: settings.trajectoryScale,
                images: this.images,
                cx: (x: number) => x,
                cy: (y: number) => y,
                update: this.update,
                initZoomBehavior: this.initZoomBehavior,
                initLayers: this.initLayers
            });
    };

    private callOnClickLayer = (fn, layer: any) => {
        if (!isFn(fn)) {
            return;
        }

        const coords = d3.mouse(this.ctx.canvas);
        const p = this.invertPoint(layer.transform.invert(coords));

        fn.bind(layer)(p);
    };

    private callOnMouseMoveLayer = (fn, layer: any) => {
        if (!isFn(fn)) {
            return;
        }

        return fn.bind(layer)(this.cursorPoint);
    };

    public initZoomBehavior = (): void => {
        this.selection
            ?.call(this.zoom)
            .on('click.zoom', this.onClickZoom.bind(this))
            .on('mousemove.zoom', this.onMouseMoveZoom.bind(this));

        if (this.togglePolygon) {
            this.selection.call(this.zoom).on('mousedown.zoom', null);
        }
    };

    public initWellLayers = (): void => {
        let startX = 0;

        let previousModel = null;

        this.wellLayers = [];

        this.selectedWells.forEach((it: WellBrief, index: number) => {
            const model = {
                data: filter(x => x.wellId === it.id, this.model.data || []),
                dataByPlasts: this.model.dataByPlasts,
                dataByWells: filter(x => x.wellId === it.id, this.model.dataByWells || []),
                perforation: filter(x => x.wellId === it.id, this.model.perforation || []),
                trajectories: filter(x => x.wellId === it.id, this.model.trajectories || []),
                wellLogging: filter(x => x.wellId === it.id, this.model.wellLogging || []),
                researchInflowProfile: filter(x => x.wellId === it.id, this.model.researchInflowProfile || []),
                proxyData: filter(x => x.wellId === it.id, this.model.proxyData || []),
                packerHistory: filter(x => x.wellId === it.id, this.model.packerHistory || []),
                efficiencyData: filter(x => x.wellId === it.id, this.model.efficiencyData || []),
                downholeHistory: filter(x => x.wellId === it.id, this.model.downholeHistory || [])
            };

            const columns = getColumns(model, this.settings.hiddenColumns);

            const width = sum(map((it: TabletColumn) => it.width, columns)) || 0;

            const canvasSize = shallow(this.canvasSize, {
                xMin: startX,
                xMax: startX + width
            });

            startX = startX + width + DEFAULT_MULTIPLE_PADDING;

            const [absTop, absBottom] = getAbsDepth(this.model, this.settings.scale);

            this.wellLayers.push({
                layers: index === 0 ? this.layers : map(x => x.clone(), this.layers),
                model: model,
                previousModel: previousModel,
                canvasSize: canvasSize,
                absTop: absTop,
                absBottom: absBottom,
                well: find(x => x.id === it.id, this.selectedWells),
                scaleY: scaleLinear().domain([absTop, absBottom]).range([canvasSize.yMin, canvasSize.yMax]),
                trajectoryScale: scaleLinear()
                    .domain(map(it => it.zAbs, model.trajectories))
                    .range(map(it => it.z, model.trajectories)),
                columns: columns
            });

            previousModel = model;
        });
    };

    public initialPosition = (): void => {
        if (!this.selection || !this.zoom) {
            return;
        }

        let scale = defaultScale;
        let translateY = this.cCenterY();

        if (this.prodObjId) {
            let minTopObject = getExtremumByObject(
                ascBy,
                'topAbs',
                filter(it => it.productionObjectId === this.prodObjId, this.model.data) ?? []
            );

            if (minTopObject) {
                const topObject = Object.values(minTopObject)[0];
                translateY = this.cy(this.scaleY(topObject) + this.height / 4);
            }
        } else {
            scale = minScale;
        }

        this.zoom.translateTo(this.selection, this.cCenterX(), translateY);
        this.zoom.scaleTo(this.selection, scale);
    };

    public initImages = (): void => {
        this.images = {};

        this.images.lithology = [];

        this.images.lithology[LithologyType.LimestoneCarbonate] = new Image(40, 38);
        this.images.lithology[LithologyType.LimestoneCarbonate].src = '/images/tablet/limestone.svg';

        this.images.lithology[LithologyType.Sandstone] = new Image(38, 44);
        this.images.lithology[LithologyType.Sandstone].src = '/images/tablet/sandstone.svg';

        this.images.lithology[LithologyType.Clay] = new Image(23, 10);
        this.images.lithology[LithologyType.Clay].src = '/images/tablet/clay.png';

        this.images.well = [];

        this.images.well[WellTypeEnum.Oil] = new Image(24, 24);
        this.images.well[WellTypeEnum.Oil].src = '/images/well/drop.svg';

        this.images.well[WellTypeEnum.Injection] = new Image(24, 24);
        this.images.well[WellTypeEnum.Injection].src = '/images/well/down.svg';

        this.images.well[WellTypeEnum.Mixed] = new Image(24, 24);
        this.images.well[WellTypeEnum.Mixed].src = '/images/well/drop_and_down.svg';

        this.images.well[WellTypeEnum.Unknown] = new Image(24, 24);
        this.images.well[WellTypeEnum.Unknown].src = '/images/well/drop_time.svg';

        this.images.imgPlus = new Image(30, 28);
        this.images.imgPlus.src = '/images/tablet/plus.svg';

        this.images.imgMinus = new Image(30, 28);
        this.images.imgMinus.src = '/images/tablet/minus.svg';

        this.images.imgFilter = new Image(52, 166);
        this.images.imgFilter.src = '/images/tablet/filterNew.svg';

        this.images.imgFilterTiny = new Image(15, 80);
        this.images.imgFilterTiny.src = '/images/tablet/filterTinyNew.svg';

        this.images.imgPipeInjection = new Image(14, 38);
        this.images.imgPipeInjection.src = '/images/tablet/pipeInjection.svg';

        this.images.imgFilterBackground = new Image(26, 83);
        this.images.imgFilterBackground.src = '/images/tablet/filterBackground.svg';

        this.images.imgBehindPipeInjection = new Image(28, 76);
        this.images.imgBehindPipeInjection.src = '/images/tablet/arrowDownNew.svg';

        this.images.imgESP = new Image(93, 112);
        this.images.imgESP.src = '/images/tablet/ESPnew.svg';

        this.images.imgSPR = new Image(93, 112);
        this.images.imgSPR.src = '/images/tablet/SPRnew.svg';

        this.images.imgDiagonalHatchRed = new Image(10, 10);
        this.images.imgDiagonalHatchRed.src = '/images/tablet/diagonalHatchRed.svg';

        // todo mb
        this.images.imgDiagonalHatchRed.onload = async () => {
            this.update();
        };
    };

    public update = (): void => {
        this.zoomed(this.canvas, this.ctx, this.currentZoomTransform());
    };

    public updateMinimap = (): void => {
        this.zoomed(this.canvasMinimap, this.ctxMinimap, this.initialMinimapPosition(), true);
    };

    public zoomIn = (): void => this.zoom.scaleBy(this.selection.transition().duration(durationTime), initialZoomStep);
    public zoomOut = (): void =>
        this.zoom.scaleBy(this.selection.transition().duration(durationTime), 1 / initialZoomStep);

    public exportFile = (): void => {
        const canvas = d3.select(`#${EXPORT_TABLET_CANVAS_ELEMENT}`) as any;
        const ctx = canvas.node().getContext('2d');

        let xMin = this.canvasSize.xMin;
        let xMax = this.canvasSize.xMax;
        let yMin = this.canvasSize.yMin;
        let yMax = this.canvasSize.yMax;

        this.wellLayers.forEach((obj: WellLayer) => {
            xMin = Math.min(xMin, obj.canvasSize.xMin);
            xMax = Math.max(xMax, obj.canvasSize.xMax);
            yMin = Math.min(yMin, obj.canvasSize.yMin);
            yMax = Math.max(yMax, obj.canvasSize.yMax);
        });

        const [width, height] = [Math.abs(xMax - xMin), Math.abs(yMax - yMin)];

        canvas.attr('width', width).attr('height', height);

        this.zoomed(canvas, ctx, this.initialExportTransform(width, height), false, true);

        saveCanvas(canvas.node());
    };

    private currentZoomTransform = () => d3.zoomTransform(this.canvas);

    private zoomed = (canvas, context, transform, isMinimap: boolean = false, isExport: boolean = false) => {
        const renderLayer = () => {
            canvas.width = this.width;
            canvas.height = this.height;

            context.save();
            context.clearRect(0, 0, this.width, this.height);

            forEach(
                obj =>
                    forEach(it => {
                        const model: TabletModel = {
                            context: context,
                            transform: transform,
                            canvasSize: obj.canvasSize,
                            width: this.width,
                            height: this.height,
                            cursorPoint: this.cursorPoint,
                            isMinimap: isMinimap,
                            isExport: isExport
                        };

                        it.render(model);
                    }, obj.layers),
                this.wellLayers
            );

            context.restore();

            this.updateBrushPosition();
        };

        requestAnimationFrame(renderLayer);
    };

    private onClickZoom = () => {
        const transform = this.currentZoomTransform();
        const coords = d3.mouse(this.ctx.canvas);
        const point = transform.invert(coords);
        const p = this.invertPoint(transform.invert(coords));

        this.onClick([p[0], p[1], coords[0], coords[1]]);

        this.wellLayers.forEach((obj: WellLayer) => {
            forEach(it => this.callOnClickLayer(it.onClick, it), obj.layers);
        });
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
            this.wellCursorPoints ?? []
        );

        this.canvas.style.cursor = item ? 'pointer' : 'auto';
    };

    private callMouseMoved = coords => {
        const mouseMoved = () => {
            const point = this.currentZoomTransform().invert(coords);
            const real = this.invertPoint(point);

            this.cursorPoint = [real[0], real[1], coords[0], coords[1]];

            this.onCursorPointMove(this.cursorPoint);

            let tooltips = [];

            this.wellLayers.forEach(obj => {
                tooltips.push(
                    find(
                        x => !!x,
                        map(it => this.callOnMouseMoveLayer(it.onTooltipMouseMove, it), obj.layers)
                    )
                );
            });

            this.tooltipData = find(it => !!it, tooltips);
        };

        requestAnimationFrame(mouseMoved);
    };

    private handleMouseMove(value) {
        this.mouseMoveQueue.push(value);
        setTimeout(this.triggerMouseMove.bind(this), mouseMoveDelay);
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
