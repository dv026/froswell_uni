import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import { ddmmyyyy } from 'common/helpers/date';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletPerforation } from 'input/entities/tabletModel';
import {
    ascBy,
    descBy,
    getExtremum,
    getExtremumByObject,
    tooltipLabelStringParameter
} from 'input/helpers/tabletHelper';
import { filter, find, forEach, head, isNil, map, mapObjIndexed, sortBy, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_STEP = 35;

class Entry {
    public label: string;
    public closed: boolean;
    public offset: number;
    public rect: number[];
    public color: string;
    public tooltip: string;
}

export class PerforationColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];
    private imgDiagonalHatchRed?: HTMLImageElement;

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: PerforationColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): PerforationColumnTabletLayer {
        return new PerforationColumnTabletLayer(this.column, this.canvasSize);
    }

    public onTooltipMouseMove(point: number[]): string {
        return find(it => this.containsPointAd(it.rect, point), this.items)?.tooltip;
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        if (!this.colomnWidth(this.column, model.columns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);
        const scopeAll = this.allColumnScope(this.column, model.columns, model.canvasSize);
        const column = this.getColumnItem(this.column, model.columns);

        let startPerforationWidth = scope[0];

        mapObjIndexed(
            item => {
                forEach(it => {
                    const topY = model.scaleY(it.topAbs);
                    const bottomY = model.scaleY(it.bottomAbs);

                    this.items.push({
                        label: it.closingDate ? `${ddmmyyyy(it.dt)}-${ddmmyyyy(it.closingDate)}` : ddmmyyyy(it.dt),
                        offset: startPerforationWidth,
                        closed: !!it.closingDate,
                        rect: [
                            model.cx(startPerforationWidth),
                            model.cy(topY),
                            model.cx(startPerforationWidth + DEFAULT_STEP),
                            model.cy(bottomY)
                        ],
                        color: it.closingDate ? colors.colors.red : colors.colors.green,
                        tooltip: head(tooltipLabelStringParameter(column, ddmmyyyy(it.dt)))
                    });
                }, item as TabletPerforation[]);

                startPerforationWidth += DEFAULT_STEP;
            },
            groupByProp(
                'dt',
                sortBy(
                    it => it.dt,
                    filter(it => !it.grpState, model.model.perforation)
                )
            )
        );

        this.imgDiagonalHatchRed = model.images.imgDiagonalHatchRed;
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            const [x1, y1] = model.transform.apply([
                d.rect[0] + (d.rect[2] - d.rect[0]) / 2,
                d.rect[1] + (d.rect[3] - d.rect[1]) / 2
            ]);

            const fontsize = this.zoomTextSize(model.transform.k);

            this.renderTextWithBackground(model, d.label, x1 + fontsize / 1.4, y1, false, {
                fontsize: this.zoomTextSize(model.transform.k),
                fillColor: d.color,
                align: 'center'
            });

            this.renderFrame(model, d.rect, d.color, d.closed ? this.imgDiagonalHatchRed : null);
        }
    }
}
