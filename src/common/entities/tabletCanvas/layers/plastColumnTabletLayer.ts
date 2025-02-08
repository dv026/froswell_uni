import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { ascBy, descBy, getExtremum, getExtremumByObject } from 'input/helpers/tabletHelper';
import { forEach, includes, isNil, map, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;

class Entry {
    public label: string;
    public rect: number[];
}

export class PlastColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: PlastColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): PlastColumnTabletLayer {
        return new PlastColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);
        const scopeAll = this.allColumnScope(this.column, model.columns, model.canvasSize);

        const minTop = getExtremum(ascBy, 'topAbs', model.model.data);
        const maxBottom = getExtremum(descBy, 'bottomAbs', model.model.data);

        forEach((it: string) => {
            if (!it) {
                return;
            }

            const topY = model.scaleY(minTop[it]);
            const bottomY = model.scaleY(maxBottom[it]);

            this.items.push({
                label: it,
                rect: [model.cx(scope[0]), model.cy(topY), model.cx(scope[2]), model.cy(bottomY)]
            });
        }, uniq(map(it => it.plastName, model.model.data)));
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            this.renderRect(model, d.rect, model.transform, colors.bg.selected, null);

            const [x1, y1] = model.transform.apply([
                d.rect[0] + (d.rect[2] - d.rect[0]) / 2,
                d.rect[1] + (d.rect[3] - d.rect[1]) / 2
            ]);

            this.renderText(model, d.label, x1, y1, false);
        }
    }
}
