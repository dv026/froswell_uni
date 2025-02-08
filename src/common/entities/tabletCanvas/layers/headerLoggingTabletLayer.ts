import { WellBrief } from 'common/entities/wellBrief';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { drawMultiline, roundRect } from 'common/helpers/canvas';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { format } from 'd3';
import { LoggingSettingModel } from 'input/entities/loggingSettingModel';
import { TabletLoggingChart } from 'input/entities/tabletLoggingChart';
import { WellLoggingEnum } from 'input/enums/wellLoggingEnum';
import { assoc, curry, filter, find, forEach, includes, isNil, map, propEq, reject, when } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { getLoggingChart } from '../helpers/logging';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { DEFAULT_TiCK_SIZE, HeaderBaseTabletLayer } from './headerBaseTabletLayer';

const alterScale = curry((scale, key, items) => map(when(propEq('dataKey', key), assoc('scale', scale)), items));

export const DEFAULT_LOGGING_GROUP_COLOR = colors.bg.grey100;
export const DEFAULT_LOGGING_HEIGHT = 48;
export const DEFAULT_LOGGING_PADDING = 6;

class EntryLogging {
    public group: number[];
    public type: WellLoggingEnum;
    public name: string;
    public unit: string;
    public color: string;
    public scale: EntryScale;
    public imgPlusBlock: number[];
    public imgMinusBlock: number[];
}

class EntryScale {
    public points: number[][];
    public rect?: number[];
}

export class HeaderLoggingTabletLayer extends HeaderBaseTabletLayer implements TabletLayer {
    public canvasSize: CanvasSize;

    private logging: EntryLogging[];
    private loggingChart: TabletLoggingChart[];
    private well: WellBrief;
    private initLayers: any;
    private initModel: InitTabletModel;

    private imgPlus?: HTMLImageElement;
    private imgMinus?: HTMLImageElement;

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: HeaderLoggingTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize);
    }

    private getScaleLogging = (model: InitTabletModel, currentY: number, scale: any, tickFormat: any): EntryScale => {
        if (includes(TabletColumnEnum.Logging, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(TabletColumnEnum.Logging, model.columns, model.canvasSize);

        const ticks = scale.ticks ? scale.ticks() : scale.domain();
        const tickFormatLocal = tickFormat ? format('') : scale.tickFormat();

        return {
            points: ticks.map(d => [
                model.cx(scope[0] + scale(d)),
                model.cy(currentY),
                scale.tickFormat()(d) ? tickFormatLocal(d) : ''
            ]),
            rect: [
                scope[0] + DEFAULT_LOGGING_PADDING,
                model.cy(currentY),
                scope[2] - DEFAULT_LOGGING_PADDING,
                model.cy(currentY)
            ]
        };
    };

    public clone(): HeaderLoggingTabletLayer {
        return new HeaderLoggingTabletLayer(this.canvasSize);
    }

    public initLayer = (model: InitTabletModel): void => {
        this.logging = [];

        if (includes(TabletColumnEnum.Logging, model.settings.hiddenColumns)) {
            return;
        }

        const loggingColumn = find(it => it.index === TabletColumnEnum.Logging, model.columns);

        let scope = this.columnScope(TabletColumnEnum.Logging, model.columns, model.canvasSize);

        this.loggingChart = this.loggingChart ?? getLoggingChart(model.model.wellLogging);
        this.well = model.well;
        this.initModel = model;
        //this.initLayers = model.initLayers;

        let currentY = this.getHeaderHeight(model) - DEFAULT_LOGGING_PADDING - DEFAULT_LOGGING_PADDING;

        forEach(
            (it: TabletLoggingChart) => {
                this.logging.push({
                    type: it.index,
                    name: it.label,
                    unit: 'Ом*м',
                    color: it.strokeColor,
                    group: [
                        model.cx(scope[0] + DEFAULT_LOGGING_PADDING),
                        model.cy(currentY),
                        model.cx(scope[0] + loggingColumn.width - DEFAULT_LOGGING_PADDING),
                        model.cy(currentY + DEFAULT_LOGGING_HEIGHT)
                    ],
                    scale: this.getScaleLogging(
                        model,
                        currentY + DEFAULT_LOGGING_HEIGHT / 1.75,
                        it.scale,
                        it.tickFormat
                    ),
                    imgMinusBlock: [scope[2] - 55, currentY + 5, 17, 17],
                    imgPlusBlock: [scope[2] - 30, currentY + 5, 17, 17]
                });
                currentY -= DEFAULT_LOGGING_HEIGHT + DEFAULT_LOGGING_PADDING;
            },
            filter(it => includes(it.index, model.settings.selectedLogging), this.loggingChart ?? [])
        );

        this.imgPlus = model.images.imgPlus;

        this.imgMinus = model.images.imgMinus;
    };

    public onClick?(point: number[]) {
        forEach(it => {
            if (this.containsPoint(it.imgMinusBlock, point)) {
                this.onChangeScale(it.type, true);
            }
            if (this.containsPoint(it.imgPlusBlock, point)) {
                this.onChangeScale(it.type, false);
            }
        }, this.logging);
    }

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.logging)) {
            return;
        }

        this.customTransform(model);

        this.renderLogging(model);
    };

    private renderLoggingScale = (model: TabletModel, scale: EntryScale) => {
        if (!scale) {
            return;
        }

        model.context.save();

        scale.points.forEach(d => {
            const [x1, y1] = this.transform.apply([d[0], d[1]]);
            const [x2, y2] = this.transform.apply([d[0], d[1] + DEFAULT_TiCK_SIZE]);

            model.context.beginPath();

            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);

            model.context.strokeStyle = colors.control.grey400;
            model.context.stroke();

            if (d[2]) {
                drawMultiline(
                    model.context,
                    d[2].toString(),
                    x1,
                    y1 + this.zoomTextTinySize(this.transform.k) * 1.2,
                    true,
                    {
                        fontsize: this.zoomTextTinySize(this.transform.k),
                        align: 'center',
                        color: colors.typo.secondary
                    }
                );
            }
        });

        model.context.restore();

        const [x1, y1] = this.transform.apply([scale.rect[0], scale.rect[1]]);
        const [x2, y2] = this.transform.apply([scale.rect[2], scale.rect[1]]);

        model.context.save();
        model.context.beginPath();

        model.context.moveTo(x1, y1);
        model.context.lineTo(x2, y2);

        model.context.strokeStyle = colors.control.grey400;
        model.context.stroke();
        model.context.restore();
    };

    private renderLogging(model: TabletModel) {
        for (const d of this.logging) {
            const zoom = this.zoomTextSize(this.transform.k);
            const rect = this.rectangle(d.group, this.transform);

            roundRect(model.context, DEFAULT_LOGGING_GROUP_COLOR, rect[0], rect[1], rect[2], rect[3], zoom / 4);

            this.renderTextWithBackground(model, d.name, rect[0] + zoom / 2, rect[1] + zoom, true, {
                fontsize: this.zoomTextSmallSize(this.transform.k),
                fillColor: d.color,
                opacity: 1,
                color: colors.colors.white
            });

            this.renderLoggingScale(model, d.scale);

            this.renderImg(model, this.transform, d.imgMinusBlock, this.imgMinus);
            this.renderImg(model, this.transform, d.imgPlusBlock, this.imgPlus);
        }
    }

    private onChangeScale?(type: WellLoggingEnum, down: boolean) {
        const it = find(x => x.index === type, this.loggingChart);

        const domain = it.scale.domain();

        if (down && domain[1] - domain[0] <= it.scaleStep) {
            return;
        }

        let newScale = it.scale;
        let currentScaleStep = (domain[1] - domain[0]) * (it.isScaleLog ? 0.25 : 0.1);

        it.scale.domain([domain[0], domain[1] + (down ? -currentScaleStep : currentScaleStep)]);

        this.loggingChart = alterScale(newScale, it.dataKey, this.loggingChart);

        let storage: LoggingSettingModel[] = [];

        const savedValue = localStorage.getItem('logging_storage');
        if (savedValue !== null) {
            storage = JSON.parse(savedValue) as LoggingSettingModel[];
        }

        if (!isNullOrEmpty(storage) && find(x => x.wellId === this.well.id && x.param === it.index, storage)) {
            storage = reject((x: LoggingSettingModel) => x.wellId === this.well.id && x.param === it.index, storage);
        }

        storage.push(new LoggingSettingModel(this.well.id, it.index, newScale.domain()[1]));

        localStorage.setItem('logging_storage', JSON.stringify(storage));

        this.initLayer(this.initModel);
        this.initModel.update();
        this.initModel.initLayers();
    }
}
