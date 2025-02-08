import React, { memo, ReactNode, useCallback } from 'react';

import { Chart } from 'common/components/chart';
import {
    any,
    ascend,
    descend,
    filter,
    includes,
    join,
    last,
    map,
    partial,
    pipe,
    reject,
    sortBy,
    sortWith,
    uniq,
    uniqBy
} from 'ramda';
import { Bar, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilState, useRecoilValue } from 'recoil';

import { AxisYStock, ColumnType } from '../../../common/components/chart';
import { AxisYCommon, yAxisLeft, yAxisRight } from '../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../common/components/charts/legends/horizontalLegend';
import { NameValueTooltip } from '../../../common/components/charts/tooltips/nameValueTooltip';
import { getLabel, ParamNameEnum } from '../../../common/enums/paramNameEnum';
import { isInj } from '../../../common/enums/wellTypeEnum';
import { ddmmyyyy } from '../../../common/helpers/date';
import { chartDataSelector, columnsSelector } from '../../store/chart/chartModel';
import { disabledLinesInjectionState, disabledLinesOilState } from '../../store/chart/disabledLines';
import { showRepairsState } from '../../store/chart/showRepairs';
import { currentSpot } from '../../store/well';

import css from '../../InputPage.module.less';

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(Date.parse(payload)));

export const ModuleChart = memo(() => {
    const columns = useRecoilValue(columnsSelector);
    const showRepairs = useRecoilValue(showRepairsState);
    const sorted = useRecoilValue(chartDataSelector);
    const well = useRecoilValue(currentSpot);

    const [disabledLinesOil, setDisabledLinesOil] = useRecoilState(disabledLinesOilState);
    const [disabledLinesInjection, setDisabledLinesInjection] = useRecoilState(disabledLinesInjectionState);

    const changeDisabledLines = (list: Array<string>) => {
        if (isInj(well.charWorkId)) {
            setDisabledLinesInjection(list);
        } else {
            setDisabledLinesOil(list);
        }
    };

    //const data = getData();
    const disabled = isInj(well?.charWorkId) ? disabledLinesInjection : disabledLinesOil;
    const onChangeDisabledLines = changeDisabledLines;
    const byWell = !!well?.id;

    const onLegendClick = useCallback(
        (dataKey: string) =>
            onChangeDisabledLines(
                includes(dataKey, disabled) ? disabled.filter(obj => obj !== dataKey) : disabled.concat(dataKey)
            ),
        [disabled, onChangeDisabledLines]
    );

    const makeColumnData = partial<ColumnType[], string[], boolean, boolean, boolean, ColumnType[]>(getColumnData, [
        columns,
        disabled
    ]);

    if (!well) {
        return null;
    }

    if (!sorted || !sorted.length) {
        return null;
    }

    return (
        <>
            <Chart
                columns={columns}
                showBrush
                data={sorted}
                disabled={disabled}
                rangeXAxisDataKey='dt'
                composed={!byWell}
            >
                <XAxis dataKey='dt' tickFormatter={dt => ddmmyyyy(new Date(Date.parse(dt)))} allowDataOverflow={true} />

                {yAxisLeft(makeAxisLabel(columns, disabled, 'left'))}
                {yAxisRight(makeAxisLabel(columns, disabled, 'right'))}

                <Tooltip
                    labelFormatter={tooltipLabelFormatter}
                    content={
                        <NameValueTooltip>{map(x => x.tooltip(), makeColumnData(true, false, true))}</NameValueTooltip>
                    }
                    isAnimationActive={false}
                />

                {!byWell && renderWellsStockBar(sorted, disabled)}

                {renderParameterLines(showRepairs, makeColumnData)}
            </Chart>
            <HorizontalLegend>
                {map(x => x.legend(disabled, onLegendClick), makeColumnData(false, false, true))}
            </HorizontalLegend>
        </>
    );
});

export const renderParameterLines = (
    showRepairs: boolean,
    makeColumns: (includeDisabled: boolean, toSort: boolean, sortDesc: boolean) => ColumnType[]
): ReactNode[] => {
    return map(
        (x: ColumnType) => x.line(showRepairs),
        reject((x: ColumnType) => x.key === 'wellsInWork', makeColumns(true, true, false))
    );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const renderWellsStockBar = (data: any, disabled: string[]) => {
    const topLimit = pipe<any, any, number>(
        sortBy((x: any) => x.wellsInWork),
        x => ((last(x) as any) || { wellsInWork: 0 }).wellsInWork
    )(data);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const axisId: AxisYStock = 'stock';

    return [
        <YAxis key='wells-in-work-axis' yAxisId={axisId} ticks={[]} domain={[0, topLimit * 3]} hide={true} />,
        <Bar
            key='wells-in-work-area'
            className={css.wellsInWorkBar}
            yAxisId={axisId}
            dataKey='wellsInWork'
            isAnimationActive={false}
            name={getLabel(ParamNameEnum.Stock)}
            hide={any(x => x === 'wellsInWork', disabled)}
        />
    ];
};

export const makeAxisLabel = (columns: ColumnType[], disabled: string[], axisId: AxisYCommon) =>
    pipe(
        filter((x: ColumnType) => x.yAxisId === axisId),
        (list: ColumnType[]) => filter((x: ColumnType) => !includes(x.key, disabled), list),
        (list: ColumnType[]) => map((x: ColumnType) => x.name, list),
        uniq,
        join('; ')
    )(columns ?? []);

export const getColumnData = (
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
