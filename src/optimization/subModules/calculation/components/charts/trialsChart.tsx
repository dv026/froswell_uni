import React, { FC, PureComponent, useEffect, useState } from 'react';

import { any, filter, find, head, isNil, map, pipe, prop, propEq, range } from 'ramda';
import { useTranslation } from 'react-i18next';
import { ComposedChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import colors from '../../../../../../theme/colors';
import {
    CalculationOptDetails,
    OptPeriod
} from '../../../../../calculation/entities/computation/calculationOptDetails';
import { EmptyData } from '../../../../../common/components/emptyData';
import { Selector } from '../../../../../common/components/selector';
import { Item, SelectorItem, SelectorItemProps } from '../../../../../common/components/selector/item';
import { mmyyyy } from '../../../../../common/helpers/date';
import { round2 } from '../../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { pc } from '../../../../../common/helpers/styles';
import {
    avgOilPressureBar,
    avgInjPressureBar,
    liquidLine,
    oilLine,
    pressureAxisY,
    productionAxisY
} from './chartParts';
import { Legend, LegendBestO, LegendPressures, LegendProduction } from './legend';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    details: CalculationOptDetails;
}

export const TrialsChart: FC<Props> = p => {
    const { t } = useTranslation();
    // был ли изменен текущий период вручную хотя бы раз.
    // Если да - не менять периоды автоматически,
    // если нет - текущим периодом является тот период, по которому в данный момент идет расчет
    const [manually, setManually] = useState<boolean>(false);
    const [periodId, setPeriodId] = useState<string>(null);

    useEffect(() => {
        if (isNil(p.details) || isNullOrEmpty(p.details.periods)) {
            return;
        }

        if (!periodId || !any(propEq('startDate', periodId), p.details.periods)) {
            // установить первый период текущим, если не установлен никакой другой
            setPeriodId(prop('startDate', head(p.details.periods)));
            return;
        }

        // если выставлен текущий период и не выключена автоматическая смена периода
        if (periodId && !manually) {
            const currentPeriod = pipe(
                filter((x: OptPeriod) => !isNullOrEmpty(x.stats)),
                (x: OptPeriod[]) => x[x.length - 1],
                prop('startDate')
            )(p.details.periods);

            if (!currentPeriod || currentPeriod === periodId) {
                return;
            }

            setPeriodId(currentPeriod);
        }
    }, [p.details, periodId, manually]);

    if (!p.details || isNullOrEmpty(p.details.periods)) {
        return <EmptyData text={t(dict.calculation.tipWaitForChart)} />;
    }

    return (
        <div className='calculation__optimization-chart-container'>
            <Selector
                className='calculation__period-selector'
                items={periods(p.details)}
                currentId={periodId}
                customItem={props => PeriodItem({ ...props, ...{ pinned: manually && props.isCurrent } })}
                onChange={x => {
                    x = x as string;

                    if (manually && x === periodId) {
                        setManually(false);
                        return;
                    }

                    setManually(true);
                    setPeriodId(x);
                }}
            />
            <div className='calculation__optimization calc-opt'>
                <ResponsiveContainer height={370} width={pc(100)}>
                    <ComposedChart
                        margin={{ top: 30, right: 15, left: 15, bottom: 5 }}
                        data={chartData(periodId, p.details)}
                        className='calculation__optimization-chart'
                    >
                        <XAxis dataKey='trialId' type='category' height={40} tick={<TrialTick />} />
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
                <LegendBestO />
                <LegendPressures />
                <LegendProduction />
            </Legend>
        </div>
    );
};

const periods = (details: CalculationOptDetails): SelectorItem[] => {
    return map(
        x => ({
            id: x.startDate,
            text: `${mmyyyy(new Date(x.startDate))} - ${mmyyyy(new Date(x.endDate))}`
        }),
        details.periods ?? []
    );
};

class ChartTrial {
    trialId: string;

    oilWellsPressure: number = null;

    injWellsPressure: number = null;

    sumOil: number = null;

    sumLiquid: number = null;
}

const SEPARATOR = '$';

const createChartTrial =
    (period: OptPeriod) =>
    (o: number): ChartTrial => {
        const chartTrial = new ChartTrial();
        const trial = find(x => x.id === o, period?.stats ?? []);

        if (trial) {
            chartTrial.injWellsPressure = round2(trial.avgInjWellsPressure);
            chartTrial.oilWellsPressure = round2(trial.avgOilWellsPressure);
            chartTrial.sumOil = round2(trial.sumOil);
            chartTrial.sumLiquid = round2(trial.sumLiquid);
        }

        chartTrial.trialId = `${trial?.isBest ? 1 : 0}${SEPARATOR}${o}`;
        return chartTrial;
    };

const chartData = (currentId: string, details: CalculationOptDetails): ChartTrial[] => {
    const currentPeriod = find(x => x.startDate === currentId, details.periods);
    if (!currentPeriod) {
        return [];
    }

    const trialInPeriod = createChartTrial(currentPeriod);
    return pipe(x => range(1, x), map(trialInPeriod))(details.maxT);
};

class TrialTick extends PureComponent<unknown> {
    render() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { x, y, payload } = this.props as any;

        const isBest = payload.value.split(SEPARATOR)[0] === '1';
        const o = payload.value.split(SEPARATOR)[1];

        return (
            <g>
                {isBest && (
                    <circle
                        r='10'
                        cx={x}
                        cy={y + 15}
                        style={{
                            fill: colors.bg.brand,
                            shapeRendering: 'geometricPrecision'
                        }}
                    />
                )}
                {isBest && (
                    <circle
                        r='14'
                        cx={x}
                        cy={y + 15}
                        style={{
                            fill: colors.bg.brand,
                            shapeRendering: 'geometricPrecision'
                        }}
                    />
                )}
                <text
                    x={x}
                    y={y}
                    textAnchor='middle'
                    dy={20}
                    style={{
                        fill: isBest ? colors.bg.white : colors.typo.primary
                    }}
                >
                    {o}
                </text>
            </g>
        );
    }
}

interface PeriodItemProps extends SelectorItemProps {
    pinned: boolean;
}

const PeriodItem: FC<PeriodItemProps> = (p: PeriodItemProps) => {
    return (
        <div className='period-selector-item'>
            <Item {...p} />
            {p.pinned && (
                <div className='period-selector-item__pin'>
                    <i className='glyphicon glyphicon-pushpin' />
                </div>
            )}
        </div>
    );
};
