import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { opacity } from 'common/helpers/colors';
import { max, round0 } from 'common/helpers/math';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletEfficiencyModel } from 'input/entities/tabletDataModel';
import { filter, find, forEach, forEachObjIndexed, includes, isNil, map, reject, sum } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { efficiencyColumns, saturationColor } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

class Entry {
    public color: string;
    public rect: number[];
    public value: string;
}

export class EfficiencyColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private items: Entry[];
    private grid: number[][];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: EfficiencyColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): EfficiencyColumnTabletLayer {
        return new EfficiencyColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        if (isNullOrEmpty(model.model.efficiencyData)) {
            return;
        }

        const allEfficiencyColumn = [
            TabletColumnEnum.EfficiencyAcidInjectionVolume,
            TabletColumnEnum.EfficiencyEmulsionInjectionVolume,
            TabletColumnEnum.EfficiencyPolyacrylamideInjectionVolume,
            TabletColumnEnum.EfficiencySlurryInjectionVolume,
            TabletColumnEnum.EfficiencyCalciumchlorideInjectionVolume,
            TabletColumnEnum.EfficiencyReagentInjectionVolume,
            TabletColumnEnum.EfficiencyOilMonth
        ];

        const firstColumn = sum(
            map(
                (x: TabletColumn) => x.width,
                filter(it => it.index <= TabletColumnEnum.OilSaturation, model.columns)
            )
        );

        if (!firstColumn) {
            return;
        }

        this.items = [];

        let currentX = firstColumn;

        forEachObjIndexed((group: TabletEfficiencyModel[], key: string) => {
            const columns = reject((c: TabletColumn) => !max(map(it => it[c.dataKey], group)), efficiencyColumns);

            forEach(column => {
                const maxValue =
                    Math.round(max(map(it => it[column.dataKey], model.model.efficiencyData)) * 1.15) || 1000;

                column.range = [0, maxValue];

                forEach((it: TabletEfficiencyModel) => {
                    const isEffect = column.dataKey === 'effectiveOilMonth';

                    const top = isEffect
                        ? model.trajectoryScale.invert(it.minTopEffect)
                        : model.trajectoryScale.invert(it.minTopVolume);
                    const bottom = isEffect
                        ? model.trajectoryScale.invert(it.maxBottomEffect)
                        : model.trajectoryScale.invert(it.maxBottomVolume);

                    const value = isEffect ? it[column.dataKey] / 1000 : it[column.dataKey];

                    if (value) {
                        const topY = model.scaleY(top);
                        const bottomY = model.scaleY(bottom);

                        this.items.push({
                            color: isEffect ? colors.colors.seagreen : colors.colors.orange,
                            value: round0(value).toString(),
                            rect: [
                                model.cx(currentX),
                                model.cy(topY),
                                model.cx(
                                    currentX + this.widthRangeScale(column.index, model.columns, it[column.dataKey])
                                ),
                                model.cy(bottomY)
                            ]
                        });
                    }
                }, group);

                currentX += column.width;
            }, columns);
        }, groupByProp('operationName', model.model.efficiencyData ?? []));
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            this.renderRect(model, d.rect, model.transform, opacity(d.color, 0.25), colors.colors.white);

            const [x1, y1] = model.transform.apply([
                d.rect[0] + (d.rect[2] - d.rect[0]) / 2,
                d.rect[1] + (d.rect[3] - d.rect[1]) / 2
            ]);

            const fontsize = this.zoomTextSize(model.transform.k);

            this.renderTextWithBackground(model, d.value, x1 + fontsize / 1.4, y1, true, {
                fontsize: this.zoomTextSize(model.transform.k),
                fillColor: d.color,
                align: 'center',
                color: colors.colors.white,
                opacity: 1
            });
        }
    }
}
