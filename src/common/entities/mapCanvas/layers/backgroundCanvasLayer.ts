// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';

import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultColor = 'white';

export class BackgroundCanvasLayer extends CommonCanvas implements MapLayer {
    private area: number[];

    public canvasSize: CanvasSize;

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    public equals(other: BackgroundCanvasLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (): void => {
        const x1 = this.cx(this.canvasSize.xMin);
        const y1 = this.cy(this.canvasSize.yMin);
        const x2 = this.cx(this.canvasSize.xMax);
        const y2 = this.cy(this.canvasSize.yMax);

        this.area = [x1, y1, x2, y2];
    };

    public render = (model: MapModel): void => {
        const [xmin, ymin] = model.transform.apply([this.area[0], this.area[1]]);
        const [xmax, ymax] = model.transform.apply([this.area[2], this.area[3]]);
        const width = Math.abs(xmax - xmin);
        const height = Math.abs(ymax - ymin);

        model.context.fillStyle = defaultColor;
        model.context.fillRect(xmin, ymax, width, height);
    };
}
