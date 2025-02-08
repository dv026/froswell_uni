import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { opacity } from 'common/helpers/colors';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { tooltipLabelLithologyParameter } from 'input/helpers/tabletHelper';
import { find, forEach, includes, isNil } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;
const IMAGE_RATIO = 1;

class Entry {
    public img: any;
    public rect: number[];
    public tooltip: string;
}

export class LithologyColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: LithologyColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): LithologyColumnTabletLayer {
        return new LithologyColumnTabletLayer(this.column, this.canvasSize);
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
            if (!it.lithologyId) {
                return;
            }

            const topY = model.scaleY(it.topAbs);
            const bottomY = model.scaleY(it.bottomAbs);

            var img = model.images.lithology[it.lithologyId];

            this.items.push({
                img: img,
                rect: [model.cx(scope[0]), model.cy(topY), model.cx(scope[2]), model.cy(bottomY)],
                tooltip: tooltipLabelLithologyParameter(column, it.lithologyId)
            });
        }, model.model.data);
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
        this.renderLines(model);
    };

    private async renderItems(model: TabletModel) {
        for (const d of this.items) {
            const rect = this.rectangle(d.rect, model.transform);

            const pattern = model.context.createPattern(d.img, 'repeat');

            if (!pattern) {
                return;
            }

            model.context.save();
            model.context.translate(rect[0], rect[1]);

            model.context.scale(model.transform.k / IMAGE_RATIO, model.transform.k / IMAGE_RATIO);

            model.context.fillStyle = pattern;
            model.context.fillRect(
                0,
                0,
                (rect[2] / model.transform.k) * IMAGE_RATIO,
                (rect[3] / model.transform.k) * IMAGE_RATIO
            );

            model.context.restore();
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
                model.context.strokeStyle = opacity(colors.bg.black, 0.5);

                model.context.stroke();
            });
        }
    }
}
