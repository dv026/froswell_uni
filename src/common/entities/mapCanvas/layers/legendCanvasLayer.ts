import * as d3 from 'd3';
import i18n from 'i18next';
import * as R from 'ramda';

import * as Prm from '../../../../common/helpers/parameters';
import { ModeMapEnum } from '../../../enums/modeMapEnum';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { InitMapModel, MapModel } from '../mapModel';
import { BaseWellsCanvasLayer } from './baseWellsCanvasLayer';
import { MapLayer } from './mapLayer';

import mainDict from '../../../helpers/i18n/dictionary/main.json';

const textAlignCenter = 'center';
const textColor = 'black';
const textFontSize = 12;
const textFontFamily = 'Inter';
const textBackground = 'rgba(255, 255, 255, 0.5)';

const defaultOffsetX = 150;
const defaultOffsetY = 120;

const defaultConst = {
    len: 20,
    edgeShift: {
        across: 5,
        along: 7
    }
};

export class LegendCanvasLayer extends BaseWellsCanvasLayer implements MapLayer {
    public modeType: ModeMapEnum;
    public canvasSize: CanvasSize;

    private oilBottom: string[];
    private injBottom: string[];

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private arc: any;

    public constructor(modeType: ModeMapEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.modeType = modeType;
        this.canvasSize = canvasSize;
    }

    public equals(other: LegendCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.modeType, other.modeType) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (model: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        this.oilBottom =
            this.modeType === ModeMapEnum.Daily
                ? [Prm.liqrate(), Prm.watercut()]
                : [Prm.accumulatedOilProduction(), Prm.accumulatedLiqRate()];

        this.injBottom =
            this.modeType === ModeMapEnum.Daily
                ? [Prm.injectionRate(), Prm.pressureZab()]
                : [Prm.accumulatedInjectionRate(), Prm.accumulatedOilProduction(), Prm.accumulatedLiqRate()];

        this.arc = d3.arc();
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (model.transform.k <= 3) {
            return;
        }

        this.oilWell(model);
        this.injWell(model);
    };

    private pie = d3
        .pie()
        .sort(null)
        .value(d => +d);

    private offsetX = () => (this.modeType !== ModeMapEnum.Daily ? defaultOffsetX * 1.2 : defaultOffsetX);

    public oilWell = (model: MapModel): void => {
        const colors = ['rgba(37, 170, 225, 1)', '#c8c8c8'];
        const [x, y] = [model.width - this.offsetX(), model.height - defaultOffsetY * 1.55];
        const arcs = this.pie([30, 70]);

        const arc = this.arc.outerRadius(0).innerRadius(20).context(model.context);

        model.context.save();
        model.context.translate(x, y);

        arcs.forEach(function (d, i) {
            model.context.beginPath();
            arc(d);
            model.context.fillStyle = colors[i];
            model.context.closePath();
            model.context.fill();
        });

        model.context.restore();

        this.renderOilWell(model, x, y, 6, textColor);

        this.wellLabel(model, x, y, this.oilBottom);
    };

    public injWell = (model: MapModel): void => {
        const colors = ['rgba(37, 170, 225, 0.85)'];
        const [x, y] = [model.width - this.offsetX(), model.height - defaultOffsetY];
        const arcs = this.pie([100]);

        const arc = this.arc.outerRadius(0).innerRadius(20).context(model.context);

        model.context.save();
        model.context.translate(x, y);

        arcs.forEach(function (d, i) {
            model.context.beginPath();
            arc(d);
            model.context.fillStyle = colors[i];
            model.context.closePath();
            model.context.fill();
        });

        model.context.restore();

        this.renderInjWell(model, x, y, 6, defaultConst.len, defaultConst.edgeShift);

        this.wellLabel(model, x, y, this.injBottom);
    };

    private wellLabel = (model: MapModel, x: number, y: number, bottom: string[]) => {
        const { context } = model;

        const title = i18n.t(mainDict.input.wellNumber);

        const fontSize = textFontSize;

        context.textAlign = textAlignCenter;
        context.fillStyle = textColor;
        context.font = `${fontSize}px ${textFontFamily}`;

        context.save();
        context.translate(x, y);

        const textWidth = Math.max(context.measureText(title).width);

        const offsetX = 20 + textWidth / 2;
        const offsetY = fontSize * 0.8;

        this.fillText(model.context, title, null, fontSize, offsetX, -offsetY);
        underline(context, textWidth, offsetX, -fontSize * 1.35, fontSize);
        this.fillText(model.context, title, bottom, fontSize, offsetX, offsetY);

        context.restore();
    };

    private fillText = (context, text, bottom, fontSize, offsetX, offsetY) => {
        const labelWidth = context.measureText(text).width * 1.1;
        context.fillStyle = textBackground;
        context.fillRect(offsetX - labelWidth / 2, offsetY - fontSize * 0.85, labelWidth, fontSize);

        if (!isNullOrEmpty(bottom)) {
            context.save();
            context.translate(offsetX, offsetY);

            const offX = 0;
            let offY = 0;
            let i = 0;
            for (const label of bottom) {
                const labelWidth = context.measureText(label).width * 1.1;
                context.fillStyle = textBackground;
                context.fillRect(offX - labelWidth / 2, offY - fontSize * 0.85, labelWidth, fontSize);

                context.fillStyle = textColor;
                context.textAlign = textAlignCenter;
                context.fillText(i < bottom.length - 1 ? label + ' -' : label, 0, offY);

                offY += 12 * 1.2;
                i++;
            }

            context.restore();
        } else {
            context.textAlign = textAlignCenter;
            context.fillStyle = textColor;
            context.fillText(text, offsetX, offsetY);
        }
    };
}

const underline = (ctx, width, x, y, size) => {
    x -= width / 2;
    y += size;

    ctx.beginPath();
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.stroke();
};
