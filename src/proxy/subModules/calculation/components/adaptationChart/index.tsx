import React, { FC, useEffect, useState } from 'react';

import { Checkbox } from '@chakra-ui/react';
import { getTickLabel } from 'proxy/subModules/calculation/components/utils';
import { filter, flatten, forEach, isNil, last, map, max, pipe, range, replace, sort, sortBy } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AdaptationTypeEnum } from '../../../../../calculation/entities/computation/adaptationTypeEnum';
import {
    AdaptationDynamics,
    CalculationDetails
} from '../../../../../calculation/entities/computation/calculationDetails';
import { getAxisLabel } from '../../../../../common/components/charts/axes';
import { round1 } from '../../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { cls, pc } from '../../../../../common/helpers/styles';
import { ErrorDot, ErrorDotActive } from './errorDot';

import css from './index.module.less';

import mainDict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface AdaptationChartProps {
    details: CalculationDetails;
    onCurrentAdaptationChange: (x: number) => void;
    xTicksFromData?: boolean;
}

export const AdaptationChart: FC<AdaptationChartProps> = ({ details, onCurrentAdaptationChange, xTicksFromData }) => {
    const { t } = useTranslation();
    const [bestOnly, setBestOnly] = useState(false);
    const [data, setData] = useState<BatchChart[]>(shapeData(false, details.adaptationDynamics));

    const errors = errorRange(details.adaptationDynamics);

    useEffect(() => {
        setData(shapeData(bestOnly, details.adaptationDynamics));
    }, [details, bestOnly]);

    return (
        <>
            <ResponsiveContainer height={370} width={pc(100)}>
                <ComposedChart
                    margin={{ top: 10, right: 15, left: 15, bottom: 10 }}
                    data={data}
                    className='chart'
                    onMouseMove={payload => onCurrentAdaptationChange(!!payload ? +payload.activeLabel : null)}
                >
                    <CartesianGrid strokeDasharray='2 2' />
                    <XAxis
                        dataKey='a'
                        xAxisId='main'
                        type='number'
                        domain={xTicksFromData ? undefined : xAxisDomain(details)}
                        ticks={xTicksFromData ? undefined : xAxisTicks(details)}
                        tickFormatter={iteration => getTickLabel(iteration, details.adaptationDynamics)}
                    />
                    <YAxis
                        yAxisId='left'
                        type='number'
                        orientation='left'
                        domain={errors}
                        tickFormatter={(v: number) => round1(v).toString()}
                        label={getAxisLabel(t(mainDict.calculation.errorTotalOilLiq), 'left')}
                    />
                    <YAxis
                        yAxisId='right'
                        type='number'
                        orientation='right'
                        domain={sumRateRange(details.adaptationDynamics)}
                        tickFormatter={(v: number) => round1(v).toString()}
                        label={getAxisLabel(t(mainDict.calculation.oilLiqProductionTotal), 'right')}
                    />
                    <Area
                        className={cls([css.adaptationChart__area, css.adaptationChart__areaPermeabilities])}
                        dataKey='areaPermeabilities'
                        stroke='none'
                        fill='none'
                        yAxisId='left'
                        xAxisId='main'
                        type='monotone'
                        isAnimationActive={false}
                    />
                    <Area
                        className={cls([css.adaptationChart__area, css.adaptationChart__areaSkinfactor])}
                        dataKey='areaSkinFactor'
                        stroke='none'
                        fill='none'
                        yAxisId='left'
                        xAxisId='main'
                        type='monotone'
                        isAnimationActive={false}
                    />
                    <Tooltip content={() => null} />
                    <Line
                        key='error'
                        type='monotone'
                        dataKey='error'
                        xAxisId='main'
                        dot={p => <ErrorDot {...p} />}
                        activeDot={p => <ErrorDotActive {...p} />}
                        yAxisId='left'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_error])}
                    />
                    <Line
                        key='sumOilRateCalc'
                        type='monotone'
                        dataKey='sumOilRateCalc'
                        xAxisId='main'
                        dot={false}
                        activeDot={false}
                        yAxisId='right'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_oilrate, css.line_calc])}
                    />
                    <Line
                        key='sumLiqRateCalc'
                        type='monotone'
                        dataKey='sumLiqRateCalc'
                        xAxisId='main'
                        dot={false}
                        activeDot={false}
                        yAxisId='right'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_liqrate, css.line_calc])}
                    />
                    <Line
                        key='sumOilRateReal'
                        type='monotone'
                        dataKey='sumOilRateReal'
                        xAxisId='main'
                        dot={false}
                        activeDot={false}
                        yAxisId='right'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_oilrate, css.line_real])}
                    />
                    <Line
                        key='sumLiqRateReal'
                        type='monotone'
                        dataKey='sumLiqRateReal'
                        xAxisId='main'
                        dot={false}
                        activeDot={false}
                        yAxisId='right'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_liqrate, css.line_real])}
                    />
                    <Line
                        key='bhpError'
                        type='monotone'
                        dataKey='bhpError'
                        xAxisId='main'
                        dot={false}
                        activeDot={false}
                        yAxisId='left'
                        isAnimationActive={false}
                        className={cls([css.line, css.line_pressureBottomHole, css.line_calc])}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <div className={css.chartLegendContainer}>
                <div className={css.chartLegend}>
                    <div className={css.chartLegend__clm}>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_title])}>
                                {t(mainDict.calculation.adaptationChart.legend.info)}
                            </div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.unit)}
                            </div>
                            <div className={css.chartLegend__cell}>{parseUnitId(details.type, details.unitId)}</div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.bestOnly)}
                            </div>
                            <div className={css.chartLegend__cell}>
                                <Checkbox isChecked={bestOnly} onChange={e => setBestOnly(e.target.checked)} />
                            </div>
                        </div>
                    </div>

                    <div className={css.chartLegend__clm}>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_title])}>
                                {t(mainDict.calculation.adaptationChart.legend.productionTotal)}
                            </div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.oilPlanFact)}
                            </div>
                            <div className={css.chartLegend__cell}>
                                <div className={css.chartLegend__cell_line}>
                                    <div className={cls([css.chartLegend__line, css.chartLegend__line_oil])} />
                                </div>
                                <div className={css.chartLegend__cell_line}>
                                    <div
                                        className={cls([
                                            css.chartLegend__line,
                                            css.chartLegend__line_oil,
                                            css.chartLegend__line_calc
                                        ])}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.liqPlanFact)}
                            </div>
                            <div className={css.chartLegend__cell}>
                                <div className={css.chartLegend__cell_line}>
                                    <div className={cls([css.chartLegend__line, css.chartLegend__line_liquid])} />
                                </div>
                                <div className={css.chartLegend__cell_line}>
                                    <div
                                        className={cls([
                                            css.chartLegend__line,
                                            css.chartLegend__line_liquid,
                                            css.chartLegend__line_calc
                                        ])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={css.chartLegend__clm}>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_title])}>
                                {t(mainDict.calculation.adaptationChart.legend.error)}
                            </div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.total)}
                            </div>
                            <div className={css.chartLegend__cell}>
                                <div className={css.chartLegend__cell_line}>
                                    <div className={cls([css.chartLegend__line, css.chartLegend__line_error])} />
                                </div>
                            </div>
                        </div>
                        <div className={css.chartLegend__row}>
                            <div className={cls([css.chartLegend__cell, css.chartLegend__cell_name])}>
                                {t(mainDict.calculation.adaptationChart.legend.bhp)}
                            </div>
                            <div className={css.chartLegend__cell}>
                                <div className={css.chartLegend__cell_line}>
                                    <div
                                        className={cls([
                                            css.chartLegend__line,
                                            css.chartLegend__line_pressureBottomHole,
                                            css.chartLegend__line_calc
                                        ])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const diff = (a: number, b: number): number => a - b;
const maxSumRate = (adaptations: AdaptationDynamics[]): number =>
    pipe(
        map<AdaptationDynamics, [number, number, number, number]>(x => [
            x.liquidProduction,
            x.liquidProductionReal,
            x.oilProduction,
            x.oilProductionReal
        ]),
        flatten,
        sort<number>(diff),
        x => x[x.length - 1]
    )(adaptations);

const sumRateRange = (adaptations: AdaptationDynamics[]): [number, number] =>
    [0, isNullOrEmpty(adaptations) ? 0 : maxSumRate(adaptations) * 1.7] as [number, number];

const maxError = (adaptations: AdaptationDynamics[]): number =>
    pipe(
        sortBy<AdaptationDynamics>(x => max(x.error, x.bhpError)),
        last,
        (x: AdaptationDynamics) => max(x.bhpError, x.error)
    )(adaptations);
const errorRange = (adaptations: AdaptationDynamics[]): [number, number] =>
    [0, isNullOrEmpty(adaptations) ? 0 : maxError(adaptations) * 1.25] as [number, number];

const xAxisDomain = (p: CalculationDetails): [number, number] => [p.minA, p.maxA];
const xAxisTicks = (p: CalculationDetails) => range(p.minA, p.maxA + 1);

class BatchChart {
    public a: number;

    public sumOilRateCalc: number;

    public sumLiqRateCalc: number;

    public sumOilRateReal: number;

    public sumLiqRateReal: number;

    public oilErrorTotalMAPE: number;

    public liqErrorTotalMAPE: number;

    public isBest: boolean;

    public areaPermeabilities: number;

    public areaSkinFactor: number;

    public adaptationType: number;

    public bhpError: number;

    /**
     * Композитная ошибка за весь период расчета
     */
    public error: number;

    public static fromRaw(adaptation: AdaptationDynamics) {
        let entity = new BatchChart();
        entity.a = adaptation.a;
        entity.sumOilRateCalc = adaptation.oilProduction;
        entity.sumLiqRateCalc = adaptation.liquidProduction;
        entity.sumOilRateReal = adaptation.oilProductionReal;
        entity.sumLiqRateReal = adaptation.liquidProductionReal;
        entity.oilErrorTotalMAPE = adaptation.oilError;
        entity.liqErrorTotalMAPE = adaptation.liquidError;
        entity.error = adaptation.error;

        entity.isBest = adaptation.isBest;
        entity.adaptationType = adaptation.adaptationType;

        entity.bhpError = adaptation.bhpError;

        return entity;
    }

    public static setAreas(adaptation: BatchChart, maxValue: number) {
        // Area устанавливается только для адаптации по скин-фактору и ОФП для визуального разграничения фона для
        // каждого типа адаптации
        adaptation.areaPermeabilities =
            adaptation.adaptationType === AdaptationTypeEnum.Permeabilities ? maxValue : null;
        adaptation.areaSkinFactor = adaptation.adaptationType === AdaptationTypeEnum.SkinFactor ? maxValue : null;
    }
}

const parseUnitId = (type: AdaptationTypeEnum, unitId: string) => {
    if (isNil(unitId)) {
        return '-';
    }

    if (type === AdaptationTypeEnum.GeoModel) {
        const parts = unitId.split('_');
        const wellId = parts[0];
        const plastIds = replace(/;/g, ', ', parts[1]);

        return `${wellId} [${plastIds}]`;
    } else if (type === AdaptationTypeEnum.SkinFactor) {
        return unitId;
    } else if (type === AdaptationTypeEnum.Permeabilities) {
        const parts = unitId.split('_');
        const plastId = parts[0];
        const regionId = parts[1];

        return `${regionId} [${plastId}]`;
    }

    return '-';
};

const shapeData = (bestOnly: boolean, dynamics: AdaptationDynamics[]) => {
    const errors = errorRange(dynamics);

    const byBest = (x: AdaptationDynamics): boolean => (bestOnly ? x.isBest : true);

    return pipe(
        filter<AdaptationDynamics>(x => byBest(x)),
        map(BatchChart.fromRaw),
        forEach(x => BatchChart.setAreas(x, errors[1])),
        sortBy(x => x.a)
    )(dynamics ?? []);
};
