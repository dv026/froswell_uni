import React from 'react';

import { append, last, pipe, prop, reduce, sortBy, find } from 'ramda';
import { useTranslation } from 'react-i18next';
import { ComposedChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import {
    CalculationOptDetails,
    OptPeriod
} from '../../../../../calculation/entities/computation/calculationOptDetails';
import { EmptyData } from '../../../../../common/components/emptyData';
import { mmyyyy } from '../../../../../common/helpers/date';
import { round2 } from '../../../../../common/helpers/math';
import { isCorrectNumber, isNullOrEmpty, sumBy } from '../../../../../common/helpers/ramda';
import { pc } from '../../../../../common/helpers/styles';
import {
    avgOilPressureBar,
    avgInjPressureBar,
    liquidLine,
    oilLine,
    pressureAxisY,
    productionAxisY
} from './chartParts';
import { Legend, LegendPressures, LegendProduction } from './legend';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    details: CalculationOptDetails;
}

/**
 * Компонент для отображения
 * @param p
 */
export const BestByPeriodChart: React.FC<Props> = (p: Props) => {
    const { t } = useTranslation();
    if (!p.details || isNullOrEmpty(p.details.periods)) {
        return <EmptyData text={t(dict.calculation.tipWaitForChart)} />;
    }

    return (
        <div className='calculation__optimization-chart-container'>
            <div className='calculation__optimization calc-opt'>
                <ResponsiveContainer height={370} width={pc(100)}>
                    <ComposedChart
                        margin={{ top: 30, right: 15, left: 15, bottom: 30 }}
                        data={chartData(p.details.periods)}
                        className='calculation__optimization-chart'
                    >
                        <XAxis dataKey='periodId' type='category' tick={<PeriodTick />} />
                        {pressureAxisY}
                        {productionAxisY}
                        {avgOilPressureBar}
                        {avgInjPressureBar}
                        {liquidLine}
                        {oilLine}
                        <Tooltip />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <Legend>
                <LegendPressures />
                <LegendProduction />
            </Legend>
        </div>
    );
};

const chartData = (periods: OptPeriod[]) =>
    pipe(
        sortBy(prop('startDate')),
        (sorted: OptPeriod[]) =>
            reduce((acc: ChartPeriod[], elem: OptPeriod) => append(ChartPeriod.create(elem, acc), acc), [])(sorted),
        shaped =>
            reduce(
                (acc: ChartPeriod[], elem: ChartPeriod) => append(ChartPeriod.updatePeriodType(elem, last(acc)), acc),
                []
            )(shaped)
    )(periods);

export type PeriodCalculationStatus = 'finished' | 'in-work' | 'pending';

const SEPARATOR = '$';

class ChartPeriod {
    periodId: string;

    oilWellsPressure: number = 0;

    injWellsPressure: number = 0;

    sumOil: number = 0;

    sumLiquid: number = 0;

    type: PeriodCalculationStatus;

    get finished(): boolean {
        return (
            (isCorrectNumber(this.injWellsPressure) || isCorrectNumber(this.oilWellsPressure)) &&
            (isCorrectNumber(this.sumOil) || isCorrectNumber(this.sumLiquid))
        );
    }

    public static create(period: OptPeriod, prevPoints: ChartPeriod[]): ChartPeriod {
        const point = new ChartPeriod();

        const bestStats = find(x => x.isBest, period.stats ?? []);
        point.periodId = `${mmyyyy(new Date(period.startDate))}${SEPARATOR}${mmyyyy(new Date(period.endDate))}`;
        point.injWellsPressure = round2(bestStats?.avgInjWellsPressure);
        point.oilWellsPressure = round2(bestStats?.avgOilWellsPressure);

        point.sumLiquid = bestStats?.sumLiquid && round2(bestStats.sumLiquid + sumBy(x => x.sumLiquid, prevPoints));
        point.sumOil = bestStats?.sumOil && round2(bestStats.sumOil + sumBy(x => x.sumOil, prevPoints));

        return point;
    }

    public static updatePeriodType(period: ChartPeriod, prev: ChartPeriod): ChartPeriod {
        const prevType = prev?.type ?? 'finished';
        if (prevType === 'finished') {
            period.type = period.finished ? 'finished' : 'in-work';
            period.periodId = period.type + SEPARATOR + period.periodId;
        } else {
            period.type = 'pending';
            period.periodId = 'pending' + SEPARATOR + period.periodId;
        }

        return period;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class PeriodTick extends React.PureComponent<any> {
    render() {
        const { x, y, payload } = this.props;
        const dates = payload.value.split(SEPARATOR);

        return (
            <g className={`label label_${dates[0]}`} transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor='middle'>
                    с: {dates[1]}
                </text>
                <text textAnchor='middle' dy={32}>
                    по: {dates[2]}
                </text>
            </g>
        );
    }
}
