import React, { memo, ReactNode, useEffect, useState } from 'react';

import {
    ascend,
    descend,
    filter,
    includes,
    join,
    map,
    partial,
    sortWith,
    uniqBy,
    uniq,
    pipe,
    reject,
    head
} from 'ramda';
import { Tooltip, XAxis } from 'recharts';

import { AxisYCommon, yAxisLeft } from '../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../common/components/charts/legends/horizontalLegend';
import { NameValueTooltip } from '../../../common/components/charts/tooltips/nameValueTooltip';
import { ParamDate } from '../../../common/entities/paramDate';
import { Range } from '../../../common/entities/range';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { ddmmyyyy } from '../../../common/helpers/date';
import { InputCompareModel } from '../../../input/entities/inputCompareModel';
import { WithDate } from '../../../input/entities/merModel';
import { Chart, ColumnType } from '../chart';
import { DateRangeProps } from '../dateRangeNew';

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(Date.parse(payload)));

interface CompareChartProps {
    data: InputCompareModel[];
    columns: ColumnType[];
}

export const CompareChart = memo((props: CompareChartProps) => {
    const { data: initialData, columns } = props;

    const [data, setData] = useState<InputCompareModel[]>([]);
    const [disabledLines, setDisabledLines] = useState<string[]>([]);

    const disabled = disabledLines;
    const showRepairs = false;

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const makeColumnData = partial<ColumnType[], string[], boolean, boolean, boolean, ColumnType[]>(getColumnData, [
        columns,
        disabled
    ]);

    const changeDisabledLines = (list: Array<string>) => {
        setDisabledLines(list);
    };

    const onLegendClick = (dataKey: string) =>
        changeDisabledLines(
            includes(dataKey, disabled) ? disabled.filter(obj => obj !== dataKey) : disabled.concat(dataKey)
        );

    return (
        <>
            <Chart columns={columns} showBrush data={data} rangeXAxisDataKey='dt' margin={{ right: 80 }}>
                <XAxis dataKey='dt' tickFormatter={dt => ddmmyyyy(new Date(Date.parse(dt)))} allowDataOverflow={true} />

                {yAxisLeft(makeAxisLabel(columns, disabled, 'left'))}
                {/* {yAxisRight(makeAxisLabel(columns, disabled, 'right'))} */}

                <Tooltip
                    labelFormatter={tooltipLabelFormatter}
                    content={
                        <NameValueTooltip>{map(x => x.tooltip(), makeColumnData(true, false, true))}</NameValueTooltip>
                    }
                    isAnimationActive={false}
                />

                {renderParameterLines(showRepairs, makeColumnData)}
            </Chart>
            <HorizontalLegend>
                {map(x => x.legend(disabled, onLegendClick), makeColumnData(false, false, true))}
            </HorizontalLegend>
        </>
    );
});

const getColumnData = (
    columns: ColumnType[],
    disabled: string[],
    includeDisabled: boolean,
    toSort: boolean,
    sortDesc: boolean
): ColumnType[] => {
    const byOrder = (x: ColumnType) => x.order;
    const sortAscFn = sortWith([ascend(byOrder)]);
    const sortDescFn = sortWith([descend(byOrder)]);

    return uniqBy(
        (x: ColumnType) => x.key,
        filter(
            w => !includeDisabled || (includeDisabled && !includes(w.key, disabled)),
            toSort ? ((sortDesc ? sortDescFn(columns) : sortAscFn(columns)) as Array<ColumnType>) : columns
        )
    );
};

const makeAxisLabel = (columns: ColumnType[], disabled: string[], axisId: AxisYCommon) =>
    pipe(
        filter((x: ColumnType) => x.yAxisId === axisId),
        (list: ColumnType[]) => filter((x: ColumnType) => !includes(x.key, disabled), list),
        (list: ColumnType[]) => map((x: ColumnType) => x.name, list),
        uniq,
        join('; ')
    )(columns ?? []);

const renderParameterLines = (
    showRepairs: boolean,
    makeColumns: (includeDisabled: boolean, toSort: boolean, sortDesc: boolean) => ColumnType[]
): ReactNode[] => {
    return map(
        (x: ColumnType) => x.line(showRepairs),
        reject((x: ColumnType) => x.key === 'wellsInWork', makeColumns(true, true, false))
    );
};

const getDateRangeBg = (columns: ColumnType[], data: WithDate[]): DateRangeProps<Range<Date>>['background'] => {
    const mainColumn = head(columns);

    if (!mainColumn) {
        return { data: [], type: 'oil' };
    }

    return {
        data: map<WithDate, ParamDate>(x => ({ date: x.dt, value: x[mainColumn.key] }), data),
        type: mainColumn.wellType === WellTypeEnum.Injection ? 'injection' : 'oil'
    };
};
