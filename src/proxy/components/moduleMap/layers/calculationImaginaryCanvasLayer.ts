import * as R from 'ramda';

import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { CommonCanvas } from '../../../../common/entities/canvas/commonCanvas';
import { Point } from '../../../../common/entities/canvas/point';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { shallowEqual } from '../../../../common/helpers/compare';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';

const radius = 4;
const color = 'red';

export class CalculationImaginaryCanvasLayer extends CommonCanvas implements MapLayer {
    public startPoint: Point;

    public point: number[];

    public constructor(startPoint: Point, canvasSize: CanvasSize) {
        super(canvasSize);

        this.startPoint = startPoint;
    }

    private zoomFactor = (k: number) => k * 1;

    public equals(other: CalculationImaginaryCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.startPoint, other.startPoint) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (): void => {
        if (R.isNil(this.startPoint)) {
            return;
        }

        this.point = [this.cx(this.startPoint.x), this.cy(this.startPoint.y)];
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.point)) {
            return;
        }

        const [x, y] = model.transform.apply(this.point);
        const r = radius + this.zoomFactor(model.transform.k);
        model.context.beginPath();
        model.context.lineWidth = 1;
        model.context.strokeStyle = color;
        model.context.arc(x, y, r + 2, 0, 2 * Math.PI);
        model.context.closePath();
        model.context.stroke();

        model.context.beginPath();
        model.context.fillStyle = color;
        model.context.arc(x, y, r, 0, 2 * Math.PI);
        model.context.closePath();
        model.context.fill();
    };
}
