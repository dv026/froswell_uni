import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { scaleLinear } from 'd3-scale';
import { TabletColumn } from 'input/entities/tabletColumn';
import { filter, find, includes, map, sum } from 'ramda';

import { CanvasSize } from '../../canvas/canvasSize';
import { TabletModel } from '../tabletModel';
import { BaseTabletLayer } from './baseTabletLayer';

export class BaseColumnTabletLayer extends BaseTabletLayer {
    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);
    }

    private startX(column: TabletColumnEnum, columns: TabletColumn[]) {
        return (
            sum(
                map(
                    (it: TabletColumn) => it.width,
                    filter(x => x.index < column, columns)
                )
            ) || 0
        );
    }

    protected isHidden(column: TabletColumnEnum, hiddenColumns: TabletColumnEnum[]) {
        return includes(column, hiddenColumns);
    }

    protected getColumnItem(column: TabletColumnEnum, columns: TabletColumn[]) {
        const colomnItem = find(x => x.index === column, columns) || 0;

        if (!colomnItem) {
            return null;
        }

        return colomnItem;
    }

    protected columnScope(column: TabletColumnEnum, columns: TabletColumn[], canvasSize: CanvasSize) {
        const startX = canvasSize.xMin + this.startX(column, columns);
        const colomnItem = find(x => x.index === column, columns) || 0;

        if (!colomnItem) {
            return;
        }

        return [startX, canvasSize.yMin, startX + colomnItem.width, canvasSize.yMax];
    }

    protected allColumnScope(column: TabletColumnEnum, columns: TabletColumn[], canvasSize: CanvasSize) {
        const startX = canvasSize.xMin + this.startX(column, columns);
        const width =
            sum(
                map(
                    (it: TabletColumn) => it.width,
                    filter(x => x.index >= column, columns)
                )
            ) || 0;

        return [startX, canvasSize.yMin, startX + width, canvasSize.yMax];
    }

    protected rangeScaleLinear = (column: TabletColumnEnum, columns: TabletColumn[]) => {
        const colomnItem = find(x => x.index === column, columns) || 0;

        if (!colomnItem) {
            return;
        }

        return scaleLinear().domain(colomnItem.range).range([0, colomnItem.width]);
    };

    protected widthRangeScale = (column: TabletColumnEnum, columns: TabletColumn[], value: number): number => {
        const colomnItem = find(x => x.index === column, columns) || 0;

        if (!colomnItem) {
            return;
        }

        let res = this.rangeScaleLinear(column, columns)(value > colomnItem.range[1] ? colomnItem.range[1] : value);
        return res < 0 ? 0 : res;
    };

    protected colomnWidth = (column: TabletColumnEnum, columns: TabletColumn[]): number => {
        const colomnItem = find(x => x.index === column, columns);

        return colomnItem?.width || 0;
    };

    protected scaleGrid = (column: TabletColumnEnum, columns: TabletColumn[], canvasSize: CanvasSize): number[][] => {
        const scope = this.columnScope(column, columns, canvasSize);

        const colomnItem = find(x => x.index === column, columns);

        if (!colomnItem) {
            return null;
        }

        let grid = [];

        let startWidth = scope[0];

        const x = this.rangeScaleLinear(column, columns);

        for (const d of x.ticks(colomnItem.rangeStep)) {
            grid.push([startWidth + x(d), scope[1], startWidth + x(d), scope[3]]);
        }

        return grid;
    };

    protected renderScaleGrid = (model: TabletModel, grid: number[][]) => {
        if (isNullOrEmpty(grid)) {
            return;
        }

        for (const line of grid) {
            const [x1, y1] = model.transform.apply([line[0], line[1]]);
            const [x2, y2] = model.transform.apply([line[2], line[3]]);

            model.context.save();
            model.context.beginPath();

            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);

            model.context.lineWidth = this.zoomLineSize(model.transform.k);
            model.context.strokeStyle = '#EEF0F2';

            model.context.stroke();
            model.context.restore();
        }
    };

    protected renderImg(model: TabletModel, transform: any, rectangle: number[], img: HTMLImageElement) {
        if (!img) {
            return;
        }

        const rect = this.rectangle(rectangle, transform);
        const zoom = this.zoomLineSize(transform.k);

        const width = img.width * zoom;
        const height = img.height * zoom;

        model.context.save();
        model.context.translate(rect[0], rect[1]);

        model.context.drawImage(img, 0, 0, width, height);

        model.context.restore();
    }
}
