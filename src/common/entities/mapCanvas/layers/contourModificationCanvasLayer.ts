import { opacity } from 'common/helpers/colors';
import { isPointBetweenPoints } from 'common/helpers/geometry';
import { filter, find, forEach, isNil, lastIndexOf, map } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { ContourModelBrief } from '../../contourModelBrief';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultSelectedStroke = opacity(colors.colors.grey, 0.2);
const defaultStrokeWidth = 10;
const defaultBufferDistance = 75;

class Entry {
    public points: number[][];
    public selected: boolean;
}

export class ContourModificationCanvasLayer extends CommonCanvas implements MapLayer {
    public contours: ContourModelBrief[];
    public activeContourId: number;
    public setActiveContourId: (value: number) => void;
    public visible?: boolean;
    public canvasSize: CanvasSize;

    private lines: Entry[];
    private selectedPoint: number[];
    //private localModel: MapModel;

    public constructor(
        contours: ContourModelBrief[],
        activeContourId: number,
        setActiveContourId: (value: number) => void,
        visible: boolean,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.contours = contours;
        this.activeContourId = activeContourId;
        this.setActiveContourId = setActiveContourId;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.1;

    public equals(other: ContourModificationCanvasLayer): boolean {
        if (!this.visible) {
            return false;
        }

        if (isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.contours, other.contours) &&
            shallowEqual(this.canvasSize, other.canvasSize) &&
            shallowEqual(this.activeContourId, other.canvasSize) &&
            shallowEqual(this.visible, other.visible)
        );
    }

    public initLayer = (): void => {
        this.lines = map(it => {
            let obj = new Entry();

            obj.points = map(x => [this.cx(x[0]), this.cy(x[1])], it.points);
            obj.selected = this.activeContourId === it.id;

            return obj;
        }, this.contours);
    };

    private isNearByBetweenPoints = (p: number[], points: number[][]) => {
        const result = filter(
            x => !!x,
            points.map((it, i) => !i || isPointBetweenPoints(p, it, points[i - 1], defaultBufferDistance))
        );
        return result ? result.length > 1 : false;
    };

    public onClick = (point: number[]) => {
        if (!this.visible) {
            return;
        }

        let result = null;

        forEach(it => {
            let obj = new Entry();

            if (this.isNearByBetweenPoints(point, it.points)) {
                result = it.id;
            }

            return obj;
        }, this.contours);

        if (this.activeContourId !== result) {
            this.setActiveContourId(result);
        }
    };

    public render = (model: MapModel): void => {
        if (!this.visible) {
            return;
        }

        if (isNullOrEmpty(this.lines)) {
            return;
        }

        model.context.save();

        forEach(it => {
            if (it.selected) {
                model.context.beginPath();

                for (const d of it.points) {
                    const [x, y] = model.transform.apply(d);
                    model.context.lineTo(x, y);
                }

                model.context.lineWidth = this.getLineWidth(defaultStrokeWidth, model);
                model.context.strokeStyle = defaultSelectedStroke;
                model.context.shadowOffsetX = 5;
                model.context.shadowOffsetY = 5;
                model.context.shadowBlur = 10;
                model.context.shadowColor = 'black';

                model.context.stroke();
            }
        }, this.lines);

        model.context.restore();
    };

    private getLineWidth = (strokeWidth: number, model: MapModel) => {
        return model.isMinimap ? 1 : strokeWidth + this.zoomFactor(model.transform.k);
    };
}
