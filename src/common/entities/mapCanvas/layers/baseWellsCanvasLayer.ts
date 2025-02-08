import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { WellProps } from '../../../../input/entities/wellProps';
import { EdgeShift } from '../../../components/mapCanvas/wellProps';
import { FundTypeEnum } from '../../../enums/fundTypeEnum';
import { roundRect } from '../../../helpers/canvas';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../canvas/commonCanvas';
import { Point } from '../../canvas/point';
import { CharworkPeriod } from '../charworkPeriod';
import { DateLabelModel } from '../dateLabelModel';
import { MapModel } from '../mapModel';
import { WellDateLabel, WellDateEnum } from '../wellDateLabel';

const textAlignCenter = 'center';
const textAlignLeft = 'left';
const textColor = 'black';
const textFontSize = 6;
const textFontFamily = 'Inter';
const textBackground = 'rgba(255, 255, 255, 0.5)';
const underlineColor = colors.control.grey400;

const defaultOffset = 2;

const injColor = colors.colors.darkblue;

const defaultConst = {
    len: 3,
    edgeShift: {
        across: 0.6,
        along: 0.6
    }
};

export class InputWellLabel {
    public x: number;
    public y: number;
    public title: string;
    public bottom: string;
    public showBottom: boolean;
    public coloredBottom: string[][];
}

export interface CanvasWellPoint {
    x: number;
    y: number;
    id: number;
    title: string;
    bottom: string;
    showBottom: boolean;
    horizontal: number[];
    coloredBottom?: string[][];
}

export class BaseWellsCanvasLayer extends CommonCanvas {
    public points: CanvasWellPoint[];

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);
    }

    protected zoomFactor = (k: number): number => k * 0.9 * this.canvasScale;

    protected zoomTextSize = (k: number, intermediate: boolean = false): number =>
        (textFontSize + k * (intermediate ? 0.9 : 1.5)) * this.canvasScale;

    protected mapHorizontal(points: ReadonlyArray<Point>): number[] {
        if (!points || points.length < 2 || !points[1]) {
            return [];
        }

        return [this.cx(points[0].x), this.cy(points[0].y), this.cx(points[1].x), this.cy(points[1].y)];
    }

    protected renderHorizontal = (model: MapModel): void => {
        if (isNullOrEmpty(this.points)) {
            return;
        }

        for (const d of this.points) {
            if (!d.horizontal) {
                continue;
            }

            const [x1, y1] = model.transform.apply([d.horizontal[0], d.horizontal[1]]);
            const [x2, y2] = model.transform.apply([d.horizontal[2], d.horizontal[3]]);
            model.context.beginPath();
            model.context.lineWidth = 1;
            model.context.strokeStyle = textColor;
            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);
            model.context.closePath();
            model.context.stroke();
        }
    };

    protected mapWellLabels(it: WellProps, isDaily: boolean): InputWellLabel {
        const sb = [];
        sb.push(
            val(it.p2),
            val(it.p3) ? '-' + val(it.p3) + (isDaily ? '%' : '') : '',
            val(it.p4) ? '-' + val(it.p4) : '',
            val(it.perfPercentage) ? ` ${val(it.perfPercentage)}%` : ''
        );

        const bottom = sb.join('');

        const input = new InputWellLabel();
        input.x = it.cx;
        input.y = it.cy;
        input.title = it.title;
        input.bottom = bottom;
        input.showBottom = !R.isEmpty(bottom);
        return input;
    }

    protected renderWellLabel = (points: CanvasWellPoint[], model: MapModel, intermediate: boolean = false): void => {
        const { context, transform } = model;

        if (transform.k < 0.8) {
            return;
        }

        const fontSize = this.zoomTextSize(transform.k, intermediate);

        context.textAlign = textAlignCenter;
        context.fillStyle = textColor;
        context.font = `${fontSize}px ${textFontFamily}`;

        for (const label of points) {
            const [x, y] = transform.apply([label.x, label.y]);
            const showBottom = transform.k > 3 && label.showBottom;

            if (!label.title) {
                continue;
            }

            context.save();
            context.translate(x + this.zoomFactor(transform.k) * defaultOffset, y);

            const textWidth = Math.max(
                context.measureText(label.title).width,
                showBottom ? context.measureText(label.bottom).width : 0
            );
            const textHeight = showBottom ? fontSize * 2 : fontSize * 0.8;

            const padding = this.zoomFactor(transform.k) / 2;

            roundRect(
                context,
                textBackground,
                -padding,
                -fontSize - padding,
                textWidth + padding * 2,
                textHeight + padding * 2,
                padding
            );

            this.renderTopText(context, label.title);

            if (showBottom) {
                this.underline(context, 0, 0, textWidth);

                this.renderBottomText(context, label.bottom, label.coloredBottom, fontSize);
            }

            context.restore();
        }
    };

    protected renderTopText = (context, text) => {
        context.save();

        context.textBaseline = 'bottom';

        context.textAlign = textAlignLeft;
        context.fillStyle = textColor;
        context.fillText(text, 0, -1);

        context.restore();
    };

    protected renderBottomText = (context, text, coloredBottom, fontSize) => {
        context.save();

        if (!isNullOrEmpty(coloredBottom)) {
            let offX = 0;

            context.translate(0, fontSize);

            for (const label of coloredBottom) {
                context.fillStyle = label[1];
                context.textAlign = textAlignLeft;
                context.fillText(label[0], offX, 0);
                offX += R.isEmpty(label[0]) ? 0 : context.measureText(label[0]).width;
            }
        } else {
            context.textAlign = textAlignLeft;
            context.fillStyle = textColor;
            context.fillText(text, 0, fontSize);
        }

        context.restore();
    };

    protected underline = (ctx, x, y, width) => {
        ctx.beginPath();
        ctx.strokeStyle = underlineColor;
        ctx.lineWidth = 1;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.closePath();
        ctx.stroke();
    };

    protected dateLabelModel = (
        fundType: FundTypeEnum,
        wellType: CharworkPeriod,
        dateLabels: WellDateLabel[]
    ): DateLabelModel => {
        if (!wellType) {
            return null;
        }

        const startDateLabel = R.any(
            it => it.type === fundType && it.param === WellDateEnum.StartDate && it.value,
            dateLabels
        );
        const closingDateLabel = R.any(
            it => it.type === fundType && it.param === WellDateEnum.ClosingDate && it.value,
            dateLabels
        );

        const startDate = startDateLabel ? wellType.startDate : null;
        const closingDate = closingDateLabel ? wellType.closingDate : null;

        return new DateLabelModel(startDate, closingDate);
    };

    protected renderWells = (
        points: CanvasWellPoint[],
        model: MapModel,
        color: string = 'black',
        intermediate: boolean = false
    ): void => {
        if (isNullOrEmpty(points)) {
            return;
        }

        this.renderHorizontal(model);

        for (const d of points) {
            const [x, y] = model.transform.apply([d.x, d.y]);

            // для промежуточных скважин размер точки должен быть в два раза меньше
            const r = wellRadius + this.zoomFactor(model.transform.k) / (intermediate ? 2 : 1);
            this.renderOilWell(model, x, y, r, color);
        }

        this.renderWellLabel(points, model, intermediate);
    };

    protected renderOilWells = (model: MapModel): void => {
        this.renderWells(this.points, model, 'black');
    };

    protected renderUnknownWells = (model: MapModel): void => {
        this.renderWells(this.points, model, 'gray');
    };

    protected renderOilWell = (model: MapModel, x: number, y: number, r: number, color: string): void => {
        model.context.beginPath();
        model.context.fillStyle = color;
        model.context.moveTo(x + r, y);
        model.context.arc(x, y, r, 0, 2 * Math.PI);
        model.context.closePath();
        model.context.fill();
    };

    protected renderInjWell = (
        model: MapModel,
        x: number,
        y: number,
        r: number,
        len: number,
        edgeShift: EdgeShift
    ): void => {
        model.context.lineWidth = 1.5;
        model.context.strokeStyle = injColor;
        model.context.fillStyle = injColor;
        model.context.lineCap = 'round';
        model.context.lineJoin = 'round';

        model.context.beginPath();

        //arrowTop
        model.context.moveTo(x, y);
        model.context.lineTo(x, y - len);
        model.context.lineTo(x - edgeShift.across, y - len + edgeShift.along);
        model.context.moveTo(x, y - len);
        model.context.lineTo(x + edgeShift.across, y - len + edgeShift.along);

        //arrowLeft
        model.context.moveTo(x, y);
        model.context.lineTo(x - len, y);
        model.context.lineTo(x - len + edgeShift.along, y + edgeShift.across);
        model.context.moveTo(x - len, y);
        model.context.lineTo(x - len + edgeShift.along, y - edgeShift.across);

        //arrowRight
        model.context.moveTo(x, y);
        model.context.lineTo(x + len, y);
        model.context.lineTo(x + len - edgeShift.along, y + edgeShift.across);
        model.context.moveTo(x + len, y);
        model.context.lineTo(x + len - edgeShift.along, y - edgeShift.across);

        //arrowBottom
        model.context.moveTo(x, y);
        model.context.lineTo(x, y + len);
        model.context.lineTo(x - edgeShift.across, y + len - edgeShift.along);
        model.context.moveTo(x, y + len);
        model.context.lineTo(x + edgeShift.across, y + len - edgeShift.along);

        model.context.closePath();
        model.context.stroke();

        //circle
        model.context.beginPath();
        model.context.moveTo(x, y);
        model.context.arc(x, y, r, 0, 2 * Math.PI);
        model.context.closePath();
        model.context.fill();
    };

    protected renderInjWells = (points: CanvasWellPoint[], model: MapModel): void => {
        if (isNullOrEmpty(points)) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);
        const len = defaultConst.len * zoom;
        const edgeShift = {
            across: defaultConst.edgeShift.across * zoom,
            along: defaultConst.edgeShift.along * zoom
        };
        const r = wellRadius + zoom;

        model.context.save();

        for (const d of points) {
            const [x, y] = model.transform.apply([d.x, d.y]);
            this.renderInjWell(model, x, y, r, len, edgeShift);
        }

        model.context.restore();

        this.renderHorizontal(model);

        this.renderWellLabel(points, model);
    };

    public renderDrilledWells = (model: MapModel): void => {
        if (isNullOrEmpty(this.points)) {
            return;
        }

        const r = wellRadius * this.zoomFactor(model.transform.k);
        for (const d of this.points) {
            model.context.beginPath();
            const [x, y] = model.transform.apply([d.x, d.y]);
            model.context.moveTo(x + r, y);
            model.context.arc(x, y, r, 0, 2 * Math.PI);
            model.context.closePath();
            model.context.lineWidth = 2;
            model.context.strokeStyle = 'black';
            model.context.stroke();
            model.context.fillStyle = 'white';
            model.context.fill();
        }

        this.renderHorizontal(model);

        this.renderWellLabel(this.points, model);
    };
}

const val = (value: number) => (isEmpty(value) ? '' : value.toString());

const isEmpty = (value: number) => (value === undefined || value === null ? true : false);
