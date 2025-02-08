// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from 'ramda';

import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseTabletLayer } from './baseTabletLayer';

const defaultColor = 'white';

export class BackgroundTabletLayer extends BaseTabletLayer implements TabletLayer {
    private area: number[];

    public canvasSize: CanvasSize;

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    public equals(other: BackgroundTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): BackgroundTabletLayer {
        return new BackgroundTabletLayer(this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        const x1 = this.cx(model.canvasSize.xMin);
        const y1 = this.cy(model.canvasSize.yMin);
        const x2 = this.cx(model.canvasSize.xMax);
        const y2 = this.cy(model.canvasSize.yMax);

        this.area = [x1, y1, x2, y2];
    };

    public render = (model: TabletModel): void => {
        this.renderRect(model, this.area, model.transform, defaultColor, defaultColor);
    };
}
