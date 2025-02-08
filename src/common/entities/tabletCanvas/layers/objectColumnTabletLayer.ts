import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { ascBy, descBy, getExtremumByObject } from 'input/helpers/tabletHelper';
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

export class ObjectColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: ObjectColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): ObjectColumnTabletLayer {
        return new ObjectColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        forEach((it: string) => {
            if (!it) {
                return;
            }

            let minTopObject = getExtremumByObject(ascBy, 'topAbs', model.model.data);
            let maxBottomObject = getExtremumByObject(descBy, 'bottomAbs', model.model.data);

            const topY = model.scaleY(minTopObject[it]);
            const bottomY = model.scaleY(maxBottomObject[it]);

            this.items.push({
                label: it,
                rect: [model.cx(scope[0]), model.cy(topY), model.cx(scope[2]), model.cy(bottomY)]
            });
        }, uniq(map(it => it.productionObjectName, model.model.data)));
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
        this.renderLines(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            this.renderRect(model, d.rect, model.transform, colors.colors.lightyellow, null);

            const [x1, y1] = model.transform.apply([
                d.rect[0] + (d.rect[2] - d.rect[0]) / 2,
                d.rect[1] + (d.rect[3] - d.rect[1]) / 2
            ]);

            this.renderText(model, d.label, x1, y1, false);
        }
    }

    private renderLines(model: TabletModel) {
        for (const d of this.items) {
            [d.rect[1], d.rect[3]].forEach(y => {
                const [x1, y1] = model.transform.apply([d.rect[0], y]);
                const [x2, y2] = model.transform.apply([d.rect[2], y]);

                model.context.beginPath();

                model.context.moveTo(x1, y1);
                model.context.lineTo(x2, y2);

                model.context.lineWidth = this.zoomLineSize(model.transform.k);
                model.context.strokeStyle = colors.colors.darkblue;

                model.context.stroke();
            });
        }
    }
}
