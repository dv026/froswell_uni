import React, { FC, useEffect, useState } from 'react';

import { find, isNil, map, pipe, sortBy, last, prop } from 'ramda';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    LabelList,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';

import colors from '../../../../../../theme/colors';
import {
    CalculationOptDetails,
    OptPeriod,
    WellDetails
} from '../../../../../calculation/entities/computation/calculationOptDetails';
import { EmptyData } from '../../../../../common/components/emptyData';
import { equalsTo, yyyymm } from '../../../../../common/helpers/date';
import { round2 } from '../../../../../common/helpers/math';
import { isNullOrEmpty, trueOrNull } from '../../../../../common/helpers/ramda';
import { cls } from '../../../../../common/helpers/styles';

import css from './wellDynamics.module.less';

interface DetailsProps {
    details: CalculationOptDetails;
}

export const WellDynamics: FC<DetailsProps> = (p: DetailsProps) => {
    const [currentWell, setCurrentWell] = useState<number>(0);

    useEffect(() => {
        if (!currentWell && !isNullOrEmpty(p.details?.wells)) {
            setCurrentWell(p.details?.wells[0].id);
        }
    }, [currentWell, setCurrentWell, p.details]);

    if (!p.details || isNullOrEmpty(p.details.periods)) {
        return <EmptyData />;
    }

    return (
        <div className={css.calcOpt}>
            <PeriodChart periods={p.details?.periods} well={find(x => x.id === currentWell, p.details?.wells ?? [])} />
            <WellList wells={p.details?.wells} currentId={currentWell} setCurrentId={setCurrentWell} />
        </div>
    );
};

interface WellListProps {
    wells: WellDetails[];
    currentId: number;
    setCurrentId: (id: number) => void;
}

const WellList = ({ wells, currentId, setCurrentId }: WellListProps) => {
    if (isNullOrEmpty(wells)) {
        return null;
    }

    return (
        <div className={css.calcOpt__wells}>
            {map(
                x => (
                    <div
                        key={x.id}
                        className={cls(css.calcOpt__well, trueOrNull(currentId === x.id, css.calcOpt__well_selected))}
                        onClick={() => setCurrentId(x.id)}
                    >
                        {x.name}
                    </div>
                ),
                wells
            )}
        </div>
    );
};

const PeriodChart = ({ periods, well }: { periods: OptPeriod[]; well: WellDetails }) => {
    if (isNullOrEmpty(periods) || isNil(well)) {
        return null;
    }

    const data = chartData(periods, well);
    const maxValue = pipe(
        sortBy<{ maxValue: number }>(x => x.maxValue),
        last,
        prop('maxValue')
    )(data ?? [{ maxValue: 10 }]) as number;

    return (
        <ResponsiveContainer height={300} width='100%'>
            <ComposedChart
                className='calculation__optimization-chart'
                data={data}
                margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis domain={[0, maxValue * 1.3]} type='number' />
                <Bar className='bar' fill={colors.colors.yellow} dataKey='value' name='Давление' unit=' атм.'>
                    <LabelList dataKey='value' formatter={v => round2(v)} position='top' />
                </Bar>
                {threshold({ key: 'minValue', name: 'Минимальное давление' })}
                {threshold({ key: 'maxValue', name: 'Максимальное давление' })}
                <Tooltip />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

const chartData = (periods: OptPeriod[], well: WellDetails) => {
    const p: Period[] = pipe(
        map((x: OptPeriod) => new Period(x.startDate, x.endDate)),
        sortBy(x => x.startDate)
    )(periods ?? []);

    let data = [];
    for (const period of p) {
        const w = find(x => equalsTo(new Date(x.periodStart), period.startDate), well?.dynamic ?? []);
        data.push({
            date: yyyymm(period.startDate),
            value: w?.value ?? null,
            defaultValue: well.defaultValue,
            minValue: w?.minValue ?? null,
            maxValue: w?.maxValue ?? null
        });
    }

    return data;
};

export class Period {
    public startDate: Date;

    public endDate: Date;

    constructor(startDate: string, endDate: string) {
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }
}

const threshold: React.FC<{ key: string; name: string }> = ({ key, name }: { key: string; name: string }) => (
    <Line
        activeDot={false}
        className='line line_threshold'
        dataKey={key}
        dot={false}
        stroke={colors.paramColors.pressure}
        isAnimationActive={false}
        name={name}
        unit=' атм.'
    />
);
