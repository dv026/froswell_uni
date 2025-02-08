import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import { ddmm, yyyy } from 'common/helpers/date';
import { max, min, round0 } from 'common/helpers/math';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletResearchInflowProfile } from 'input/entities/tabletModel';
import { tooltipLabelResearchParameter } from 'input/helpers/tabletHelper';
import { concat, filter, find, flatten, forEach, forEachObjIndexed, groupBy, isNil, map, toPairs, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { saturationColor } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;

class EntryResearch {
    public label: string;
    public value: number;
    public color: string;
    public rect: number[];
    public percent: number[];
    public frame: number[];
    public tooltip: string;
}

class Entry {
    public date: string;
    public group: number[];
    public research: EntryResearch[];
}

export class LoggingResearchColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: LoggingResearchColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): LoggingResearchColumnTabletLayer {
        return new LoggingResearchColumnTabletLayer(this.column, this.canvasSize);
    }

    public onTooltipMouseMove(point: number[]): string {
        return find(it => this.containsPointAd(it.rect, point), flatten(map(x => x.research, this.items)))?.tooltip;
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);
        const column = this.getColumnItem(this.column, model.columns);

        const width = 75;
        const margin = 10;
        const barWidth = 40;
        const barHeight = 30;
        const labelHeight = 40;

        const selectedResearch = map(it => it.getDate(), model.settings.selectedResearch);

        const group = groupBy(
            (x: TabletResearchInflowProfile) => `${ddmm(x.dt)}\n${yyyy(x.dt)}`,
            filter(it => selectedResearch.includes(it.dt.getDate()), model.model.researchInflowProfile)
        );

        const length = toPairs(group).length;

        let i = 0;

        forEachObjIndexed((points: TabletResearchInflowProfile[], key: string) => {
            if (!model.settings.selectedResearch.includes(points[0].dt)) {
                return;
            }

            const topGroupY = model.scaleY(model.trajectoryScale.invert(min(map(it => it.top, points))));
            const bottomGroupY = model.scaleY(model.trajectoryScale.invert(max(map(it => it.bottom, points))));

            const research = [];
            const x = scope[2] + (width + margin) * i - width * length;

            forEach((it: TabletResearchInflowProfile) => {
                const topY = model.scaleY(model.trajectoryScale.invert(it.top));
                const bottomY = model.scaleY(model.trajectoryScale.invert(it.bottom));

                const color = find(c => c.type === it.saturationTypeId, saturationColor);

                research.push({
                    label: `${round0(it.value)}%`,
                    value: it.value,
                    color: color?.color || colors.bg.black,
                    rect: [
                        model.cx(x),
                        model.cy((topY + bottomY) / 2 - barHeight / 2),
                        model.cx(x + barWidth),
                        model.cy((topY + bottomY) / 2 + barHeight / 2)
                    ],
                    percent: [
                        model.cx(x),
                        model.cy((topY + bottomY) / 2 - barHeight / 2),
                        model.cx(x + (barWidth * it.value) / 100),
                        model.cy((topY + bottomY) / 2 + barHeight / 2)
                    ],
                    frame: [
                        model.cx(x - barWidth / 1.5),
                        model.cy(topY),
                        model.cx(x - barWidth / 1.5 + barWidth),
                        model.cy(bottomY)
                    ],
                    tooltip: tooltipLabelResearchParameter(column, it)
                });
            }, points);

            this.items.push({
                group: [model.cx(x), model.cy(topGroupY - labelHeight), model.cx(x + barWidth), model.cy(bottomGroupY)],
                research: research,
                date: key
            });

            i++;
        }, group);
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        if (model.isMinimap) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const g of this.items) {
            const rect = this.rectangle(g.group, model.transform);

            roundRect(
                model.context,
                opacity(colors.colors.white, 0.75),
                rect[0],
                rect[1],
                rect[2],
                rect[3],
                this.zoomFactor(model.transform.k) / 4,
                colors.colors.brown,
                this.zoomLineSize(model.transform.k)
            );

            this.renderText(
                model,
                g.date,
                rect[0] + this.zoomFactor(model.transform.k) * 22,
                rect[1] + this.zoomFactor(model.transform.k) * 12,
                true,
                { align: 'center' }
            );

            this.renderResearch(model, g.research);
        }
    }

    private renderResearch(model: TabletModel, research: EntryResearch[]) {
        for (const d of research) {
            this.renderRect(model, d.rect, model.transform, opacity(d.color, 0.4), opacity(d.color, 0.4));
            this.renderRect(model, d.percent, model.transform, d.color, d.color);

            const [x1, y1] = model.transform.apply([
                d.rect[0] + (d.rect[2] - d.rect[0]) / 2,
                d.rect[1] + (d.rect[3] - d.rect[1]) / 2
            ]);

            this.renderText(model, d.label, x1, y1, true, { align: 'center', color: colors.colors.white });

            this.renderFrame(model, d.frame, colors.colors.brown);

            const [x2, y2] = model.transform.apply([d.rect[0], d.rect[1] + (d.rect[3] - d.rect[1]) / 2]);

            this.renderBlock(model, x2, y2);
        }
    }

    private renderBlock(model: TabletModel, x1: number, y1: number) {
        model.context.save();
        model.context.beginPath();

        model.context.moveTo(x1, y1);
        model.context.lineTo(x1 - this.zoomTextSize(model.transform.k) / 2, y1);

        model.context.lineWidth = this.zoomLineSize(model.transform.k);
        model.context.strokeStyle = colors.colors.brown;

        model.context.stroke();
        model.context.restore();
    }
}
