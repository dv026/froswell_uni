import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import { ddmmyyyy } from 'common/helpers/date';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import i18n from 'i18next';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletPerforation } from 'input/entities/tabletModel';
import {
    ascBy,
    descBy,
    getExtremum,
    getExtremumByObject,
    tooltipHydraulicFracturingParameter
} from 'input/helpers/tabletHelper';
import { filter, find, forEach, head, isNil, map, mapObjIndexed, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_STEP = 35;

class Entry {
    public label: string;
    public type: number;
    public offset: number;
    public rect: number[];
    public tooltip: string;
}

export class HydraulicFracturingColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: HydraulicFracturingColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): HydraulicFracturingColumnTabletLayer {
        return new HydraulicFracturingColumnTabletLayer(this.column, this.canvasSize);
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

        mapObjIndexed(
            item => {
                let startPerforationWidth = scope[0];

                forEach(it => {
                    const topY = model.scaleY(it.topAbs);
                    const bottomY = model.scaleY(it.bottomAbs);

                    this.items.push({
                        label: ddmmyyyy(it.dt),
                        offset: startPerforationWidth,
                        type: 0,
                        rect: [
                            model.cx(startPerforationWidth),
                            model.cy(topY),
                            model.cx(startPerforationWidth + DEFAULT_STEP),
                            model.cy(bottomY)
                        ],
                        tooltip: head(
                            tooltipHydraulicFracturingParameter(
                                `${i18n.t(dict.common.hydraulicFracturing)} ${ddmmyyyy(it.dt)}`
                            )
                        )
                    });
                }, item as TabletPerforation[]);

                startPerforationWidth += DEFAULT_STEP;
            },
            groupByProp(
                'dt',
                filter(it => it.grpState, model.model.perforation)
            )
        );
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

            this.renderTextWithBackground(model, d.label, x1 + fontsize / 1.2, y1, false, {
                fontsize: this.zoomTextSize(model.transform.k),
                fillColor: colors.colors.red,
                align: 'center'
            });

            this.renderRectangle(model, d.rect);
        }
    }

    private renderRectangle(model: TabletModel, rect: number[]) {
        const [x1, y1] = model.transform.apply([rect[0], rect[1]]);
        const [x2, y2] = model.transform.apply([rect[2], rect[3]]);

        const zoom = this.zoomFactor(model.transform.k);

        model.context.beginPath();

        model.context.moveTo(x1 + (x2 - x1) / 2, y1);
        model.context.lineTo(x1 + (x2 - x1) / 2, y2);

        model.context.lineWidth = this.zoomLineSize(model.transform.k) * 5;
        model.context.strokeStyle = colors.colors.red;

        model.context.stroke();
    }
}
