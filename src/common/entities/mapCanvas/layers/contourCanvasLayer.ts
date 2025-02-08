import { find, forEach, isNil, map } from 'ramda';

import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { ContourModelBrief } from '../../contourModelBrief';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const colorBlue = '#008ce1';
const colorRed = '#ff0037';
const colorOrange = '#ff8c00';
const colorGray = 'gray';
const colorGold = '#ffd700';
const colorPink = '#FE8282';

const strokeDasharray1 = [8, 8, 4, 8];
const strokeDasharray2 = [8, 4];
const strokeWidth1 = 1.5;
const strokeWidth2 = 2;

class Entry {
    public stroke: string;
    public strokeWidth: number;
    public dasharray: number[];
    public points: number[][];
}

export class ContourCanvasLayer extends CommonCanvas implements MapLayer {
    public lines: Entry[];
    public canvasSize: CanvasSize;

    public contours: ContourModelBrief[];

    public constructor(contours: ContourModelBrief[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.contours = contours;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.1;

    public equals(other: ContourCanvasLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.contours, other.contours) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (): void => {
        this.lines = map(it => {
            const contourType = find(x => x.key === it.type, contourStyle);

            let obj = new Entry();
            obj.stroke = contourType.stroke;
            obj.strokeWidth = contourType.strokeWidth;
            obj.dasharray = contourType.strokeDasharray;
            obj.points = map(x => [this.cx(x[0]), this.cy(x[1])], it.points);

            return obj;
        }, this.contours);
    };

    public render = (model: MapModel): void => {
        if (isNullOrEmpty(this.lines)) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);

        model.context.save();
        forEach(it => {
            model.context.beginPath();

            for (const d of it.points) {
                const [x, y] = model.transform.apply(d);
                model.context.lineTo(x, y);
            }

            model.context.lineWidth = this.getLineWidth(it.strokeWidth, model);
            model.context.strokeStyle = it.stroke;
            model.context.setLineDash(map(k => k * zoom, it.dasharray));

            model.context.stroke();
        }, this.lines);
        model.context.restore();
    };

    private getLineWidth = (strokeWidth: number, model: MapModel) => {
        return model.isMinimap ? 1 : strokeWidth + this.zoomFactor(model.transform.k);
    };
}

export const contourStyle = [
    {
        key: 0,
        name: 'Граница неопределенного типа',
        stroke: colorGray,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 1,
        name: 'Лицензионная граница',
        strokeDasharray: [],
        stroke: colorGold,
        strokeWidth: strokeWidth2,
        className: 'strokeWidth2'
    },
    {
        key: 2,
        name: 'Внешний контур нефтеносности внутрь',
        stroke: colorBlue,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 3,
        name: 'Внешний контур нефтеносности наружу',
        stroke: colorBlue,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 4,
        name: 'Внутренний контур нефтеносности внутрь',
        stroke: colorRed,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 5,
        name: 'Внутренний контур нефтеносности наружу',
        stroke: colorRed,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 6,
        name: 'Замещение коллектора внутрь',
        stroke: colorOrange,
        strokeDasharray: strokeDasharray2,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray2 strokeWidth1'
    },
    {
        key: 7,
        name: 'Замещение коллектора наружу',
        stroke: colorOrange,
        strokeDasharray: strokeDasharray2,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray2 strokeWidth1'
    },
    {
        key: 8,
        name: 'Выклинивание коллектора внутрь',
        stroke: colorGold,
        strokeDasharray: strokeDasharray2,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray2 strokeWidth1'
    },
    {
        key: 9,
        name: 'Выклинивание коллектора наружу',
        stroke: colorGold,
        strokeDasharray: strokeDasharray2,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray2 strokeWidth1'
    },
    {
        key: 11,
        name: 'Внешний контур газоносности внутрь',
        stroke: colorPink,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    },
    {
        key: 12,
        name: 'Внешний контур газоносности наружу',
        stroke: colorPink,
        strokeDasharray: strokeDasharray1,
        strokeWidth: strokeWidth1,
        className: 'strokeDasharray1 strokeWidth1'
    }
];
