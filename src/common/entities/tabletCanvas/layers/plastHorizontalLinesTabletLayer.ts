import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { roundRect } from 'common/helpers/canvas';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { ascBy, descBy, getExtremum, getExtremumByObject } from 'input/helpers/tabletHelper';
import { find, forEach, isNil, map, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { DEFAULT_MULTIPLE_PADDING } from '../baseTablet';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;

class Entry {
    public name: string;
    public borders: number[];
}

class ConnectionEntry {
    public name: string;
    public connectionTop: number[];
    public connectionBottom: number[];
}

export class PlastHorizontalLinesTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];
    private previousItems: ConnectionEntry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: PlastHorizontalLinesTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): PlastHorizontalLinesTabletLayer {
        return new PlastHorizontalLinesTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);
        const scopeAll = this.allColumnScope(this.column, model.columns, model.canvasSize);
        const scopeFirstAll = this.allColumnScope(TabletColumnEnum.Object, model.columns, model.canvasSize);

        const minTop = getExtremum(ascBy, 'topAbs', model.model.data);
        const maxBottom = getExtremum(descBy, 'bottomAbs', model.model.data);

        forEach((it: string) => {
            if (!it) {
                return;
            }

            const topY = model.scaleY(minTop[it]);
            const bottomY = model.scaleY(maxBottom[it]);

            this.items.push({
                name: it,
                borders: [model.cx(scopeAll[0]), model.cy(topY), model.cx(scopeAll[2]), model.cy(bottomY)]
            });
        }, uniq(map(it => it.plastName, model.model.data)));

        if (isNullOrEmpty(model?.previousModel?.data)) {
            return;
        }

        const previousMinTop = getExtremum(ascBy, 'topAbs', model.previousModel.data);
        const previousMaxBottom = getExtremum(descBy, 'bottomAbs', model.previousModel.data);

        this.previousItems = [];

        forEach((it: string) => {
            if (!it) {
                return;
            }

            const topY = model.scaleY(previousMinTop[it]);
            const bottomY = model.scaleY(previousMaxBottom[it]);

            const item = find(x => x.name === it, this.items);

            if (!item) {
                return;
            }

            this.previousItems.push({
                name: it,
                connectionTop: [
                    model.cx(scopeFirstAll[0] - DEFAULT_MULTIPLE_PADDING),
                    model.cy(topY),
                    model.cx(scopeFirstAll[0]),
                    model.cy(item.borders[1])
                ],
                connectionBottom: [
                    model.cx(scopeFirstAll[0] - DEFAULT_MULTIPLE_PADDING),
                    model.cy(bottomY),
                    model.cx(scopeFirstAll[0]),
                    model.cy(item.borders[3])
                ]
            });
        }, uniq(map(it => it.plastName, model.previousModel.data)));
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        if (model.isMinimap) {
            return;
        }

        this.renderLines(model);
        this.renderConnectionLines(model);
    };

    private renderLines(model: TabletModel) {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        for (const d of this.items) {
            [d.borders[1], d.borders[3]].forEach((y, i) => {
                const [x1, y1] = model.transform.apply([d.borders[0], y]);
                const [x2, y2] = model.transform.apply([d.borders[2], y]);

                model.context.beginPath();

                model.context.moveTo(x1, y1);
                model.context.lineTo(x2 + this.zoomTextSize(model.transform.k), y2);

                model.context.lineWidth = this.zoomLineSize(model.transform.k);
                model.context.strokeStyle = colors.colors.darkblue;

                model.context.stroke();

                this.renderLabel(model, x2, y1, `${d.name} ${i === 0 ? 'top' : 'bottom'}`);
            });
        }
    }

    private renderConnectionLines(model: TabletModel) {
        if (isNullOrEmpty(this.previousItems)) {
            return;
        }

        for (const d of this.previousItems) {
            [d.connectionTop, d.connectionBottom].forEach((p, i) => {
                const [x1, y1] = model.transform.apply([p[0], p[1]]);
                const [x2, y2] = model.transform.apply([p[2], p[3]]);

                model.context.beginPath();

                model.context.moveTo(x1, y1);
                model.context.lineTo(x2, y2);

                model.context.lineWidth = this.zoomLineSize(model.transform.k);
                model.context.strokeStyle = colors.colors.darkblue;

                model.context.stroke();
            });
        }
    }

    private renderLabel(model: TabletModel, x: number, y: number, text: string) {
        const zoom = this.zoomTextSize(model.transform.k);
        const width = model.context.measureText(text).width * zoom * 0.135;
        const height = zoom * 1.25;

        model.context.save();
        model.context.beginPath();
        model.context.translate(x + zoom / 4, y - height / 2);

        roundRect(model.context, colors.colors.darkblue, 0, 0, width, height, zoom / 3);

        model.context.closePath();
        model.context.restore();

        this.renderText(model, text, x + width / 2 + zoom / 4, y, true, {
            align: 'center',
            color: colors.colors.white
        });
    }
}
