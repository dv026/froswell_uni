import React from 'react';

import * as R from 'ramda';
import { includes } from 'ramda';
import { Line } from 'recharts';
import Gradient from 'tinygradient';

import {
    PaletteGroupLegend,
    PropertyGroupColors
} from '../../../../../common/components/charts/legends/paletteGroupLegend';
import {
    makePropertyColor,
    PaletteTooltip,
    PropertyColor
} from '../../../../../common/components/charts/tooltips/paletteTooltip';
import { mmyyyy } from '../../../../../common/helpers/date';
import { px } from '../../../../../common/helpers/styles';
import { AdaptationINSIM, AdaptationDateINSIM, byAdaptationMode, PropsINSIM } from '../../../../entities/insim/well';
import { PlastInfo } from '../../../../entities/report/plastInfo';
import { BestAdaptationEnum } from '../../../calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../../calculation/enums/resultDataTypeEnum';
import { ChartBuilder, ChartViewData, valueProp } from '../../entities/chartBuilder';
import { modeName } from '../../helpers/modeNameManager';
import { getBestAdaptation, ParameterEnum } from './helpers';

const pLine = (propName: string, color: string, median: boolean): JSX.Element => (
    <Line
        key={propName}
        type='monotone'
        dataKey={propName}
        yAxisId='left'
        strokeWidth={px(median ? 3 : 2)}
        strokeDasharray={median ? undefined : `${px(11)} ${px(8)}`}
        stroke={color}
        dot={false}
        isAnimationActive={false}
    />
);

const baseColors = ['rgb(161, 190, 237)', 'rgb(58, 125, 234)'];

export class BestByPlast implements ChartBuilder {
    private readonly _name: string;
    private readonly unit: string;
    private readonly plasts: PlastInfo[];
    private readonly bestType: BestAdaptationEnum;
    private colors: PropertyColor[];

    private readonly getProp: (a: PropsINSIM) => number;

    public constructor(
        getProp: (a: PropsINSIM) => number,
        name: string,
        unit: string,
        plasts: PlastInfo[],
        bestType: BestAdaptationEnum
    ) {
        this._name = modeName(name); //`insim-${name}-best-by-plast`;
        this.unit = unit;
        this.bestType = bestType;

        this.getProp = getProp;
        this.plasts = plasts;
    }

    public name(): string {
        return this._name;
    }

    public render(
        data: AdaptationINSIM[],
        adaptationMode: ResultDataTypeEnum,
        hiddenLines: string[],
        updateLines: (l: string[] | string) => void
    ): ChartViewData {
        const palette =
            this.plasts.length <= 2
                ? baseColors
                : R.map(x => x.toRgbString(), Gradient(baseColors).rgb(this.plasts.length));

        const colors = R.pipe(
            (x: string[]) => R.zip(this.plasts, x),
            R.map(x =>
                makePropertyColor(
                    x[1],
                    x[0],
                    x => valueProp(x.id),
                    x => x.name
                )
            )
        )(palette);

        const group: PropertyGroupColors = {
            title: null,
            colors: colors
        };

        let domainRange = undefined;

        if (includes(ParameterEnum.Watercut, this.name())) {
            domainRange = [0, 100];
        }

        return {
            data: this.shapeData(data, adaptationMode),
            domainRange: domainRange,
            domainRangeRight: undefined,
            legend: {
                content: () => (
                    <PaletteGroupLegend groups={[group]} hiddenLines={hiddenLines} updateLines={updateLines} />
                ),
                payload: []
            },
            lines: R.map(
                plast => pLine(valueProp(plast.id), R.find(x => x.key === valueProp(plast.id), colors).color, true),
                this.plasts
            ),
            tooltip: {
                payload: [],
                renderFn: () => <PaletteTooltip palette={colors} />
            },
            yLeftAxisLabel: this.unit
        };
    }

    private shapeData(data: AdaptationINSIM[], adaptationMode: ResultDataTypeEnum): unknown {
        const best = getBestAdaptation(data, this.bestType);
        const filterFn = byAdaptationMode(adaptationMode);
        const make = (dt: Date) => {
            const current = R.find(x => x.date.getTime() === dt.getTime(), best.dates);

            if (!filterFn(current)) {
                return null;
            }

            if (R.isNil(current)) {
                return null;
            }

            let item = {
                date: mmyyyy(dt)
            };

            R.forEach(p => {
                const it = R.find(y => y.plastId === p.id, current.calculatedProps);
                if (it) {
                    item[valueProp(p.id)] = this.getProp(it);
                }
            }, this.plasts);

            return item;
        };

        // отсортированные уникальные даты из таблицы
        const uniqDates = R.sort(
            x => x.getTime(),
            R.map<AdaptationDateINSIM, Date>(x => x.date, data[data.length - 1].dates)
        );

        return R.pipe(R.map(make), R.reject(R.isNil))(uniqDates);
    }
}
