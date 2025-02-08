import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { opacity } from 'common/helpers/colors';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { find, forEach, isNil } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { saturationColor } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

class Entry {
    public color: string;
    public rect: number[];
}

export class ProxyColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public dataKey: string;
    public color: string;
    public canvasSize: CanvasSize;

    private items: Entry[];
    private grid: number[][];

    public constructor(column: TabletColumnEnum, dataKey: string, color: string, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.dataKey = dataKey;
        this.color = color;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: ProxyColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): ProxyColumnTabletLayer {
        return new ProxyColumnTabletLayer(this.column, this.dataKey, this.color, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        if (isNullOrEmpty(scope)) {
            return;
        }

        this.items = [];

        forEach(it => {
            const topY = model.scaleY(it.topAbs);
            const bottomY = model.scaleY(it.bottomAbs);

            this.items.push({
                color: opacity(this.color ?? find(c => c.type === it.saturationType, saturationColor).color, 0.5),
                rect: [
                    model.cx(scope[0]),
                    model.cy(topY),
                    model.cx(scope[0] + this.widthRangeScale(this.column, model.columns, it[this.dataKey])),
                    model.cy(bottomY)
                ]
            });
        }, model?.model?.proxyData ?? []);

        this.grid = this.scaleGrid(this.column, model.columns, model.canvasSize);
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderScaleGrid(model, this.grid);
        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            this.renderRect(model, d.rect, model.transform, d.color, colors.colors.white);
        }
    }
}
