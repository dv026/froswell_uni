import * as R from 'ramda';

import { colorGradient } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { AccumulatedFlow } from '../accumulatedFlow';
import { InitMapModel, MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultFlowRate = 25;
const defaultColorStep = 50;
const triAngle = 0.05;

const oilFlowPalette = ['rgb(180,180,180)', 'red'];
const injFlowPalette = ['rgb(180,180,180)', '#146eb4'];

const defaultBorderColor = 'black';

export class AccumulatedFlowCanvasLayer extends CommonCanvas implements MapLayer {
    public defaultFlows: AccumulatedFlow;
    public show: boolean;
    public scale: boolean;
    public real: boolean;
    public canvasSize: CanvasSize;

    private flows: number[][];
    private maxFlowRate: number;
    private minInterwellVolume: number;
    private maxInterwellVolume: number;
    private injMaxFlowRate: number;
    private injMinInterwellVolume: number;
    private injMaxInterwellVolume: number;

    private oilColorsGradient: tinycolor.Instance[];
    private injColorsGradient: tinycolor.Instance[];

    public constructor(
        defaultFlows: AccumulatedFlow,
        show: boolean,
        scale: boolean,
        real: boolean,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.defaultFlows = defaultFlows;
        this.show = show;
        this.scale = scale;
        this.real = real;
        this.canvasSize = canvasSize;
    }

    public equals(other: AccumulatedFlowCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.defaultFlows, other.defaultFlows) &&
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.real, other.real) &&
            shallowEqual(this.scale, other.scale) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        if (R.isNil(this.defaultFlows)) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.oilColorsGradient = colorGradient(oilFlowPalette);
        this.injColorsGradient = colorGradient(injFlowPalette);

        this.maxFlowRate = this.defaultFlows.maxFlowRate;
        this.minInterwellVolume = this.defaultFlows.minInterwellVolume;
        this.maxInterwellVolume = this.defaultFlows.maxInterwellVolume;

        this.injMaxFlowRate = this.defaultFlows.injMaxFlowRate;
        this.injMinInterwellVolume = this.defaultFlows.injMinInterwellVolume;
        this.injMaxInterwellVolume = this.defaultFlows.injMaxInterwellVolume;

        this.flows = R.map(
            flow => [
                this.cx(flow[0]),
                this.cy(flow[1]),
                this.cx(flow[2]),
                this.cy(flow[3]),
                flow[4] / (this.scale ? flow[7] : flow[6] ? this.injMaxFlowRate : this.maxFlowRate),
                flow[5],
                flow[6]
            ],
            this.defaultFlows.data
        );
    };

    private getColor = (value, isInj) => {
        const rgb = (palette, min, max) => {
            const index = Math.round((value - min) / ((max - min) / defaultColorStep));
            return palette[index && index >= 0 && index < palette.length ? index : 0].toRgbString();
        };

        return isInj === 1
            ? rgb(this.injColorsGradient, this.injMinInterwellVolume, this.injMaxInterwellVolume)
            : rgb(this.oilColorsGradient, this.minInterwellVolume, this.maxInterwellVolume);
    };

    private zoomLineWidth = (k: number, r: boolean) => k * (r ? 0.4 : 0.1) * this.canvasScale;

    private zoomFlow = (k: number) => defaultFlowRate * k * this.canvasScale;

    public zoomFactor = (k: number): number => k * 0.5 * this.canvasScale;

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show || isNullOrEmpty(this.flows)) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);

        model.context.save();

        for (const flow of this.flows) {
            model.context.beginPath();

            const [x, y] = model.transform.apply([flow[0], flow[1]]);
            const [x2, y2] = model.transform.apply([flow[2], flow[3]]);

            const distance = this.zoomFlow(model.transform.k) * flow[4];
            const angle = -1 * Math.atan2(x2 - x, y2 - y) + Math.PI / 2;

            const x3 = x + Math.cos(angle - triAngle) * distance;
            const y3 = y + Math.sin(angle - triAngle) * distance;

            const x4 = x + Math.cos(angle + triAngle) * distance;
            const y4 = y + Math.sin(angle + triAngle) * distance;

            model.context.moveTo(x, y);
            model.context.lineTo(x3, y3);
            model.context.lineTo(x4, y4);
            model.context.lineTo(x, y);

            model.context.lineWidth = this.zoomLineWidth(model.transform.k, this.real);
            model.context.strokeStyle = defaultBorderColor;
            model.context.fillStyle = this.getColor(flow[5], flow[6]);

            if (this.real) {
                model.context.setLineDash([zoom, zoom]);
            }

            if (this.real) model.context.closePath();

            model.context.stroke();
            model.context.fill();
        }

        model.context.restore();
    };
}
