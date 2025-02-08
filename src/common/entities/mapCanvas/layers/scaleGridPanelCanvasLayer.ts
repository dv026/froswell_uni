import * as R from 'ramda';
import { flatten } from 'ramda';

import { GridMapEnum } from '../../../enums/gridMapEnum';
import { colorGradient } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { max, min, round } from '../../../helpers/math';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { PaletteProps } from '../paletteProps';
import { MapLayer } from './mapLayer';

const defaultColorStep = 50;

const w = 40;
const h = 25;
const divider = 7;
const offsetX = 20;
const offsetY = 70;

// TODO: типизация
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class ScaleGridPanelCanvasLayer extends CommonCanvas implements MapLayer {
    public data: number[][];
    public range: number[];
    public active: any;
    public palette: Array<PaletteProps>;
    public measure: string;
    public canvasSize: CanvasSize;

    private colors: tinycolor.Instance[];
    private minValue: number;
    private maxValue: number;

    public constructor(
        data: number[][],
        range: number[],
        active: any,
        palette: PaletteProps[],
        stepSize: number,
        measure: string,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        if (isNullOrEmpty(data) || active === GridMapEnum.None) {
            return;
        }

        this.data = data;
        this.range = range;
        this.active = active;
        this.palette = palette;
        this.measure = measure;
        this.canvasSize = new CanvasSize(canvasSize.xMin, canvasSize.yMin, canvasSize.xMax, canvasSize.yMax, stepSize);
    }

    public equals(other: ScaleGridPanelCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.range, other.range) &&
            shallowEqual(this.active, other.active) &&
            shallowEqual(this.palette, other.palette) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = () => {
        if (isNullOrEmpty(this.data)) {
            return;
        }

        if (this.active === GridMapEnum.None || this.active === GridMapEnum.CalculationMode) {
            return;
        }

        this.colors = colorGradient(R.find(x => x.key === this.active, this.palette)?.colors);

        const data2 = R.filter(Boolean, flatten(R.map(it => it, this.data)));

        if (
            !isNullOrEmpty(this.range) &&
            [GridMapEnum.OilSaturation, GridMapEnum.InitialSaturationAdaptation].includes(this.active)
        ) {
            this.minValue = this.range[0];
            this.maxValue = this.range[1];
        } else {
            this.minValue = min(data2) as number;
            this.maxValue = max(data2) as number;
        }
    };

    public render = (model: MapModel) => {
        if (model.isMinimap || model.isExport) {
            return;
        }

        if (isNullOrEmpty(this.data) || this.active === GridMapEnum.None) {
            return;
        }

        model.context.save();

        const diff = this.maxValue - this.minValue;
        const step = diff / divider;
        const digits = diff <= 0.1 ? 3 : diff <= 10 ? 2 : diff <= 100 ? 1 : 0;

        let i = 0;
        let j = 0;
        for (i = this.minValue; j < divider; i += step, j++) {
            model.context.save();
            model.context.translate(model.width - w - offsetX, j * h + offsetY);

            const gradient = model.context.createLinearGradient(0, 0, 0, h);

            gradient.addColorStop(0, this.getColor(i));
            gradient.addColorStop(1, this.getColor(i + step));

            model.context.fillStyle = gradient;
            model.context.fillRect(0, 0, w, h);

            if (j === 0) {
                this.renderLineDelimiter(model, round(i, digits).toFixed(digits).toString(), 0);
            }

            this.renderLineDelimiter(
                model,
                round(i + step, digits)
                    .toFixed(digits)
                    .toString(),
                h
            );

            model.context.restore();
        }

        this.renderMeasure(model, j);

        model.context.restore();
    };

    private renderLineDelimiter(model: MapModel, value: string, y: number) {
        model.context.beginPath();
        model.context.strokeStyle = 'gray';
        model.context.lineWidth = 1;
        model.context.moveTo(0, y);
        model.context.lineTo(w, y);
        model.context.closePath();
        model.context.stroke();

        model.context.textAlign = 'right';
        model.context.font = '12px Inter';

        const labelWidth = model.context.measureText(value).width * 1.1;
        model.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
        model.context.fillRect(0 - labelWidth, y - 12 / 2, labelWidth, 12);

        model.context.fillStyle = 'black';
        model.context.fillText(value, -1, y + 4);
    }

    private getColor = value => {
        if (isNullOrEmpty(this.colors)) {
            return 'white';
        }

        const index = Math.round((value - this.minValue) / ((this.maxValue - this.minValue) / defaultColorStep));
        return this.colors[index && index >= 0 && index < this.colors.length ? index : 0].toRgbString();
    };

    private renderMeasure = (model: MapModel, top: number) => {
        model.context.textAlign = 'center';
        model.context.fillStyle = 'black';
        model.context.font = `12px Inter`;

        model.context.fillText(this.measure, model.width - w / 2 - offsetX, top * h + offsetY + 20);
    };
}
