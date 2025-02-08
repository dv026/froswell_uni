// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any  */
import * as d3 from 'd3';
import * as R from 'ramda';

import { shallowEqual } from '../../../helpers/compare';
import { groupByProp, isNullOrEmpty, forEachIndexed } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from './../mapModel';
import { MapLayer } from './mapLayer';

const lineColor = 'green';
const textBackground = 'rgba(255, 255, 255, 0.5)';

const textAlign = 'center';
const defaultFontSize = 10;
const lineFillStyle = 'green';

const strokeWidth = 0.5;

const textOffset = 50;
const textFactor = 1.4;

class Entry {
    public value: number;
    public stroke: string;
    public strokeWidth: number;
    public points: number[][];
    public labels: any[];
}

export class IsolineCanvasLayer extends CommonCanvas implements MapLayer {
    private lines: Entry[];
    private labels: any[];

    public isolines: any[];
    public canvasSize: CanvasSize;

    public constructor(isolines: any[], canvasSize: CanvasSize) {
        super(canvasSize);

        if (isNullOrEmpty(isolines)) {
            return;
        }

        this.isolines = isolines;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.2 * this.canvasScale;

    public equals(other: IsolineCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.isolines, other.isolines) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (model: InitMapModel): void => {
        if (isNullOrEmpty(this.isolines)) {
            return;
        }

        this.setCanvasScale(model?.scale);

        const groups = groupByProp('c', this.isolines);

        this.lines = [];
        this.labels = [];

        R.forEachObjIndexed((item: any) => {
            R.forEach((x: any) => {
                let obj = new Entry();
                obj.value = x.c;
                obj.stroke = lineColor;
                obj.strokeWidth = strokeWidth;
                obj.points = R.pipe<any[], number[][]>(R.map(it => [this.cx(it[0]), this.cy(it[1])]))(x.p);

                obj.labels = [];

                // не показывать изолинии меньше 20 точек
                if (obj.points.length < 20) {
                    return;
                }

                const p = R.drop(1, obj.points);
                const possibilities = d3.range(textOffset, textOffset * textFactor);
                const scores = R.map(d => -((p.length - 1) % d), possibilities);
                const n = possibilities[d3.scan(scores)];

                let j = 1;

                const start = 1 + (d3.scan(R.map(xy => (j === 0 ? -1 : 1) * xy[1], obj.points)) % n);
                const margin = 2;

                const w = this.cWidth();
                const h = this.cHeight();

                const threshold = x.c;

                forEachIndexed((xy: number[], i) => {
                    if (
                        i % n === start &&
                        xy[0] > margin &&
                        xy[0] < w - margin &&
                        xy[1] > margin &&
                        xy[1] < h - margin
                    ) {
                        const a = (i - 2 + p.length) % p.length,
                            b = (i + 2) % p.length,
                            dx = p[b][0] - p[a][0],
                            dy = p[b][1] - p[a][1];
                        if (dx === 0 && dy === 0) return;

                        this.labels.push({
                            threshold,
                            xy: R.map(d => 1 * d, xy),
                            angle: Math.atan2(dy, dx),
                            text: `${threshold}`
                        });
                    }
                }, p);

                this.lines.push(obj);
            }, item);
        }, groups);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.lines)) {
            return;
        }

        const fontSize = defaultFontSize * this.zoomFactor(model.transform.k);

        //lines;
        R.forEach(it => {
            model.context.save();
            model.context.beginPath();

            for (const d of it.points) {
                const [x, y] = model.transform.apply(d);
                model.context.lineTo(x, y);
            }

            model.context.lineWidth = it.strokeWidth * this.zoomFactor(model.transform.k);
            model.context.strokeStyle = it.stroke;
            model.context.stroke();
        }, this.lines);

        //labels;
        if (model.transform.k > 2.5) {
            for (const label of this.labels) {
                const [x, y] = model.transform.apply(label.xy);
                model.context.save();
                model.context.translate(x, y);
                model.context.rotate(label.angle + (Math.cos(label.angle) < 0 ? Math.PI : 0));

                model.context.font = `${fontSize}px Inter`;

                const textWidth = model.context.measureText(label.text).width * 1.2;
                model.context.fillStyle = textBackground;
                model.context.fillRect(-textWidth / 2, -fontSize / 2, textWidth, fontSize);

                model.context.textAlign = textAlign;
                model.context.fillStyle = lineFillStyle;
                model.context.fillText(label.text, -1, 4);

                model.context.restore();
            }
        }

        model.context.restore();
    };
}
