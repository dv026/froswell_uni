import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { curveBasis, curveCardinal, curveLinear, curveMonotoneX, curveNatural, line } from 'd3';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletLoggingChart } from 'input/entities/tabletLoggingChart';
import { ascBy, descBy, getExtremum } from 'input/helpers/tabletHelper';
import { filter, find, forEach, includes, isNil, map } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { getLoggingChart } from '../helpers/logging';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;

class Entry {
    public line: any;
    public data: any;
    public strokeColor: string;
    public strokeWidth: number;
}

export class LoggingColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: LoggingColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): LoggingColumnTabletLayer {
        return new LoggingColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        const minAbsDepth = scope[1];
        const maxAbsDepth = scope[3];

        const loggingChart = getLoggingChart(model.model.wellLogging);

        forEach(
            (it: TabletLoggingChart) => {
                const item = find(x => x.index === it.index, loggingChart);

                this.items.push({
                    line: line().curve(curveLinear),
                    strokeColor: it.strokeColor,
                    strokeWidth: it.strokeWidth,
                    data: map(
                        d => [
                            model.cx(scope[0] + item.scale(d[it.dataKey])),
                            model.cy(model.scaleY(model.trajectoryScale.invert(d['dept'])))
                        ],
                        filter(
                            it =>
                                model.scaleY(model.trajectoryScale.invert(it.dept)) >= minAbsDepth &&
                                model.scaleY(model.trajectoryScale.invert(it.dept)) <= maxAbsDepth,
                            model.model.wellLogging
                        )
                    )
                });
            },
            filter(it => includes(it.index, model.settings.selectedLogging), loggingChart ?? [])
        );
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderLines(model);
    };

    private renderLines(model: TabletModel) {
        for (const d of this.items) {
            model.context.beginPath();

            d.line
                .x(d => model.transform.apply(d)[0])
                .y(d => model.transform.apply(d)[1])
                .context(model.context)(d.data);

            model.context.lineWidth = d.strokeWidth * this.zoomLineSize(model.transform.k);
            model.context.opacity = 0.7;
            model.context.strokeStyle = d.strokeColor;
            model.context.stroke();
            model.context.closePath();
        }
    }
}
