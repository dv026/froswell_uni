import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { forEach, isNil } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseTabletLayer } from './baseTabletLayer';

const DEFAULT_COLOR = colors.control.grey400;
const DEFAULT_LINE_WIDTH = 1;

class Entry {
    public background: string;
    public rect: number[];
}

export class GridTabletLayer extends BaseTabletLayer implements TabletLayer {
    public canvasSize: CanvasSize;

    private grid: Entry[];

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: GridTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): GridTabletLayer {
        return new GridTabletLayer(this.canvasSize);
    }

    public initLayer = (model: InitTabletModel): void => {
        this.grid = [];

        let currentX = model.canvasSize.xMin;

        forEach(it => {
            const column = new Entry();
            column.background = it.background;
            column.rect = [
                model.cx(currentX),
                model.cy(model.canvasSize.yMin),
                model.cx(currentX + it.width),
                model.cy(model.canvasSize.yMax)
            ];
            currentX += it.width;

            this.grid.push(column);
        }, model.columns);
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.grid)) {
            return;
        }

        this.renderGrid(model);
    };

    private renderGrid(model: TabletModel) {
        for (const d of this.grid) {
            this.renderRect(model, d.rect, model.transform, null, DEFAULT_COLOR);
        }
    }
}
