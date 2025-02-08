import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { includes, map } from 'ramda';
import { Line } from 'recharts';
import Gradient from 'tinygradient';

import {
    PaletteGroupLegend,
    PropertyGroupColors
} from '../../../../../common/components/charts/legends/paletteGroupLegend';
import { PaletteGroupTooltip } from '../../../../../common/components/charts/tooltips/paletteGroupTooltip';
import { makePropertyColor, PropertyColor } from '../../../../../common/components/charts/tooltips/paletteTooltip';
import { mmyyyy } from '../../../../../common/helpers/date';
import { round1 } from '../../../../../common/helpers/math';
import { findOrDefault } from '../../../../../common/helpers/ramda';
import { px } from '../../../../../common/helpers/styles';
import { AdaptationINSIM, byAdaptationMode, NeighborINSIM, NeighborTypeEnum } from '../../../../entities/insim/well';
import { NeighborModel } from '../../../../entities/neighborModel';
import { PlastInfo } from '../../../../entities/report/plastInfo';
import { BestAdaptationEnum } from '../../../calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../../calculation/enums/resultDataTypeEnum';
import { ChartBuilder, ChartViewData, valueProp } from '../../entities/chartBuilder';
import { modeName } from '../../helpers/modeNameManager';
import { getBestAdaptation, ParameterEnum } from './helpers';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

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

const baseColors = ['rgb(51, 204, 51)', 'rgb(255, 0, 0)', 'rgb(51, 51, 204)'];

export class AllBestByNeighbors implements ChartBuilder {
    private readonly _name: string;
    private readonly param: ParameterEnum;
    private readonly unit: string;
    private readonly bestType: BestAdaptationEnum;
    private readonly plasts: PlastInfo[];
    private readonly neighbors: NeighborModel[];
    private readonly wellName: string;
    private readonly plastId: number;

    private colors: PropertyColor[];

    private getParam: (x: NeighborINSIM) => number;

    public constructor(
        getParam: (x: NeighborINSIM) => number,
        paramName: string,
        unit: string,
        plastId: number,
        plasts: PlastInfo[],
        neighbors: NeighborModel[],
        wellName: string,
        bestType: BestAdaptationEnum
    ) {
        this._name = modeName(paramName, plastId);
        this.bestType = bestType;
        this.unit = unit;
        this.plasts = R.isNil(plastId) ? plasts : R.filter(x => x.id === plastId, plasts);
        this.neighbors = neighbors;
        this.wellName = wellName;
        this.plastId = plastId;

        this.getParam = getParam;
    }

    private forAllPlasts() {
        return R.isNil(this.plastId);
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
            data[0].defaultNeighbors().length <= 3
                ? baseColors
                : R.map(x => x.toRgbString(), Gradient(baseColors).rgb(data[0].defaultNeighbors().length));

        const ngh = (id: number): NeighborINSIM => R.find(x => x.id === id, data[0].defaultNeighbors());

        const neighbors = this.forAllPlasts()
            ? data[0].defaultNeighbors()
            : R.filter(x => x.plastId === this.plastId, data[0].defaultNeighbors());

        const withPlasts = R.pipe(
            (x: string[]) => R.zip(neighbors, x),
            R.map(x =>
                makePlastPropertyColor(
                    x[1],
                    x[0],
                    x => valueProp(uniqId(x)),
                    x => getNeighborHeaderTitle(ngh(x.id), wellName(x.wellId, this.neighbors), this.wellName)
                )
            )
        )(palette);

        const colors = R.map(x => x.color, withPlasts);

        const uniqPlasts = R.uniq(R.map(x => x.plastId, neighbors));
        const groups: PropertyGroupColors[] = R.map(
            plastId => ({
                title: `${i18n.t(dict.common.plast)}: ${R.find(p => p.id === plastId, this.plasts)?.name}`,
                colors: R.map(
                    (x: PlastPropertyColor) => x.color,
                    R.filter(c => c.id === plastId, withPlasts)
                )
            }),
            uniqPlasts
        );

        let domainRange = undefined;
        let tickFormatterLeft = undefined;

        if (includes(ParameterEnum.FBL, this.name())) {
            domainRange = ['dataMin', 1];
            tickFormatterLeft = (v: number) => round1(v).toString();
        }

        return {
            data: this.shapeData(data, adaptationMode),
            domainRange: domainRange,
            domainRangeRight: undefined,
            tickFormatterLeft: tickFormatterLeft,
            legend: {
                content: () => (
                    <PaletteGroupLegend groups={groups} hiddenLines={hiddenLines} updateLines={updateLines} />
                ),
                height: this.plasts.length * 20,
                payload: []
            },
            lines: map(x => pLine(x.key, x.color, true), colors),
            tooltip: {
                payload: [],
                renderFn: () => <PaletteGroupTooltip className='tooltip_interwells' palette={groups} />
            },
            yLeftAxisLabel: this.unit
        };
    }

    private shapeData(data: AdaptationINSIM[], adaptationMode: ResultDataTypeEnum): unknown {
        const filterFn = byAdaptationMode(adaptationMode);
        const best = getBestAdaptation(data, this.bestType);
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

            const neighbors = this.forAllPlasts()
                ? current.neighbors
                : R.filter(x => x.plastId === this.plastId, current.neighbors);
            R.forEach(x => {
                item[valueProp(uniqId(x))] = this.getParam(x);
            }, neighbors);

            return item;
        };

        // отсортированные уникальные даты из таблицы
        const uniqDates = R.sort<Date>(
            x => x.getTime(),
            R.map(x => x.date, data[data.length - 1].dates)
        );

        return R.reject(R.isNil, R.map(make, uniqDates));
    }
}

const getNeighborHeaderTitle = (neighbor: NeighborINSIM, neighborName: string, wellName: string): string => {
    switch (neighbor.type) {
        case NeighborTypeEnum.Well:
            return `${wellName} - ${neighborName}`;
        case NeighborTypeEnum.Underwater:
            return i18n.t(dict.common.waterFrom.bottom);
        case NeighborTypeEnum.Sector1:
            return i18n.t(dict.common.waterFrom.contour1);
        case NeighborTypeEnum.Sector2:
            return i18n.t(dict.common.waterFrom.contour2);
        case NeighborTypeEnum.Sector3:
            return i18n.t(dict.common.waterFrom.contour3);
        case NeighborTypeEnum.Sector4:
            return i18n.t(dict.common.waterFrom.contour4);
        case NeighborTypeEnum.Sector5:
            return i18n.t(dict.common.waterFrom.contour5);
        case NeighborTypeEnum.Sector6:
            return i18n.t(dict.common.waterFrom.contour6);
        default:
            return '-';
    }
};

const uniqId = (n: NeighborINSIM): string => `${n.plastId}-${n.type}-${n.wellId}`;
const wellName = (wellId: number, neighbors: NeighborModel[]) =>
    findOrDefault(
        x => x.wellId === wellId,
        x => x.name,
        `[${wellId}]`,
        neighbors
    );

export interface PlastPropertyColor {
    id: number;
    color: PropertyColor;
}

const makePlastPropertyColor = (
    color: string,
    obj: NeighborINSIM,
    getKey: (x) => string,
    getName: (x) => string
): PlastPropertyColor => ({ id: obj.plastId, color: makePropertyColor(color, obj, getKey, getName) });
