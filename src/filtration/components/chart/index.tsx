import React, { FC, useEffect, useState } from 'react';

import { Flex } from '@chakra-ui/react';
import { DateRangeNew, DateRangeProps } from 'common/components/dateRangeNew';
import {
    ascend,
    descend,
    filter,
    find,
    head,
    join,
    includes,
    last,
    map,
    partial,
    pipe,
    prop,
    sortBy,
    sortWith,
    uniq
} from 'ramda';
import { Tooltip, XAxis } from 'recharts';

import { Chart, ColumnType } from '../../../common/components/chart';
import { yAxisLeft, yAxisRight } from '../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../common/components/charts/legends/horizontalLegend';
import { NameValueTooltip } from '../../../common/components/charts/tooltips/nameValueTooltip';
import { ParamDate } from '../../../common/entities/paramDate';
import { Range } from '../../../common/entities/range';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { ddmmyyyy, gteByMonth, lteByMonth } from '../../../common/helpers/date';
import { WithDate } from '../../../input/entities/merModel';

import css from './index.module.less';

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(Date.parse(payload)));

export interface ChartProps {
    columns: ColumnType[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    disabled: Array<string>;
    onChangeDisabledLines: (list: Array<string>) => void;
}

export const FiltrationChart: FC<ChartProps> = (props: ChartProps) => {
    const [data, setData] = useState<WithDate[]>([]);
    const [currentRange, setCurrentRange] = useState<Range<Date>>(null);
    const [currentLimits, setCurrentLimits] = useState<Range<Date>>(null);

    useEffect(() => {
        const sorted = sortBy<WithDate>(
            prop('dt'),
            props.data && props.data.length ? props.data : [{ dt: new Date() }]
        );

        setData(sorted);
        setCurrentRange(new Range(head(sorted).dt, last(sorted).dt));
        setCurrentLimits(new Range(head(sorted).dt, last(sorted).dt));
    }, [props.data]);

    const makeColumnData = partial<ColumnType[], string[], boolean, boolean, boolean, ColumnType[]>(getColumnData, [
        props.columns,
        props.disabled
    ]);

    const onLegendClick = (dataKey: string) =>
        props.onChangeDisabledLines(
            includes(dataKey, props.disabled)
                ? props.disabled.filter(obj => obj !== dataKey && obj !== `${dataKey}Old`)
                : props.disabled.concat([dataKey, `${dataKey}Old`])
        );

    if (!props.data || !props.data.length || !currentLimits || !currentRange) {
        return null;
    }

    return (
        <Flex w='100%' direction='column'>
            <Chart {...props} data={data} rangeXAxisDataKey={'dt'}>
                <XAxis dataKey='dt' tickFormatter={dt => ddmmyyyy(new Date(Date.parse(dt)))} allowDataOverflow={true} />

                {yAxisLeft(makeAxisLabel(props.columns, props.disabled, 'left'))}
                {yAxisRight(makeAxisLabel(props.columns, props.disabled, 'right'))}

                <Tooltip
                    labelFormatter={tooltipLabelFormatter}
                    content={
                        <NameValueTooltip>{map(x => x.tooltip(), makeColumnData(true, false, true))}</NameValueTooltip>
                    }
                    isAnimationActive={false}
                />
                {renderParameterLines(makeColumnData)}
            </Chart>
            <div className={css.chartDates}>
                <DateRangeNew
                    background={getDateRangeBg(makeColumnData(false, false, true), props.data)}
                    isRange={true}
                    current={currentRange}
                    limits={currentLimits}
                    size='xs'
                    showEdges={{ min: true, max: true }}
                    onChange={(current: Range<Date>) => {
                        setCurrentRange(current);
                        setData(
                            filter(
                                (x: WithDate) => gteByMonth(x.dt, current.min) && lteByMonth(x.dt, current.max),
                                props.data
                            )
                        );
                    }}
                />
            </div>
            <HorizontalLegend>
                {map(x => x.legend(props.disabled, onLegendClick), makeColumnData(false, false, true))}
            </HorizontalLegend>
        </Flex>
    );
};

const getColumnData = (
    columns: ColumnType[],
    disabled: string[],
    includeDisabled: boolean,
    toSort: boolean = false,
    sortDesc: boolean = false
) => {
    const byOrder = (x: ColumnType): number => x.order;
    const sortAscFn = sortWith<ColumnType>([ascend(byOrder)]);
    const sortDescFn = sortWith<ColumnType>([descend(byOrder)]);

    return uniq(
        filter(
            w => !includeDisabled || (includeDisabled && !includes(w.key, disabled)),
            toSort ? ((sortDesc ? sortDescFn(columns) : sortAscFn(columns)) as ColumnType[]) : columns
        )
    );
};

const renderParameterLines = (
    makeColumns: (includeDisabled: boolean, toSort: boolean, sortDesc: boolean) => ColumnType[]
) => map(x => x.line(false), makeColumns(true, true, false));

const makeAxisLabel = (columns: ColumnType[], disabled: string[], axisId: string) =>
    pipe(
        filter((x: ColumnType) => x.yAxisId === axisId && !includes(x.key, disabled)),
        // filter((x: ColumnType) => !includes(x.key, disabled)),
        map((x: ColumnType) => x.name),
        uniq,
        join('; ')
    )(columns || []);

const getDateRangeBg = (columns: ColumnType[], data: WithDate[]): DateRangeProps<Range<Date>>['background'] => {
    const mainColumn = find(x => x.order === 1, columns);
    if (!mainColumn) {
        return { data: [], type: 'oil' };
    }

    return {
        data: map<WithDate, ParamDate>(x => ({ date: x.dt, value: x[mainColumn.key] }), data),
        type: mainColumn.wellType === WellTypeEnum.Injection ? 'injection' : 'oil'
    };
};
