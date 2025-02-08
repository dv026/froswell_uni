import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { tooltipLabelSaturationParameter } from 'input/helpers/tabletHelper';
import { any, find, forEach, includes, isNil, map, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { saturationColor } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;

class Entry {
    public color: string;
    public rect: number[];
    public tooltip: string;
}

export class SaturationColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: SaturationColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): SaturationColumnTabletLayer {
        return new SaturationColumnTabletLayer(this.column, this.canvasSize);
    }

    public onTooltipMouseMove(point: number[]): string {
        return find(it => this.containsPointAd(it.rect, point), this.items)?.tooltip;
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);
        const column = this.getColumnItem(this.column, model.columns);

        forEach(it => {
            const topY = model.scaleY(it.topAbs);
            const bottomY = model.scaleY(it.bottomAbs);

            this.items.push({
                color: find(c => c.type === it.saturationTypeId, saturationColor)?.color,
                rect: [model.cx(scope[0]), model.cy(topY), model.cx(scope[2]), model.cy(bottomY)],
                tooltip: tooltipLabelSaturationParameter(column, it)
            });
        }, model.model.data);
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            this.renderRect(model, d.rect, model.transform, d.color, colors.colors.white);
        }
    }
}
