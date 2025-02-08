/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useLayoutEffect, useState } from 'react';

import { Box, Spacer } from '@chakra-ui/react';
import { ParamDate } from 'common/entities/paramDate';
import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { opacity } from 'common/helpers/colors';
import { round2 } from 'common/helpers/math';
import { isNullOrEmpty, mapIndexed } from 'common/helpers/ramda';
import { getColumnData, makeAxisLabel, renderParameterLines, renderWellsStockBar } from 'input/components/chart';
import { CorrelationItem } from 'input/components/moduleMultipleChart';
import { WithDate } from 'input/entities/merModel';
import { head, includes, map, partial, prop, filter, sortBy } from 'ramda';
import { ReferenceLine, Tooltip, XAxis } from 'recharts';

import colors from '../../../../theme/colors';
import { Chart, ColumnType } from '../../../common/components/chart';
import { WellBrief } from '../../../common/entities/wellBrief';
import { addMonth, ddmmyyyy, monthDiff } from '../../../common/helpers/date';
import { Range } from '../../entities/range';
import { yAxisLeft, yAxisRight } from '../charts/axes';
import { HorizontalLegend } from '../charts/legends/horizontalLegend';
import { NameValueTooltip } from '../charts/tooltips/nameValueTooltip';
import { DateRangeMultipleWrapper } from '../dateRangeMultipleWrapper';
import { DateRangeProps } from '../dateRangeNew';

import css from './index.module.less';

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));

interface MultipleChartProps {
    columns: ColumnType[];
    showRepairs?: boolean;
    data: any[][];
    wells: WellBrief[];
    disabled: string[];
    wellNames?: string[];
    referenceLines?: CorrelationItem[];
    sync?: boolean;
    changeDisabledLines: (list: Array<string>) => void;
}

export const MultipleChart = memo((props: MultipleChartProps) => {
    const {
        columns,
        showRepairs = false,
        wells,
        wellNames = [],
        referenceLines = [],
        disabled,
        sync = true,
        changeDisabledLines
    } = props;

    const [data, setData] = useState([]);

    useLayoutEffect(() => {
        setData(props.data);
    }, [props.data]);

    if (!data || data.length < 2) {
        return null;
    }

    if (!wells || wells.length < 2) {
        return null;
    }

    const byWell = !!wells[0]?.id;

    const makeColumnData = partial<ColumnType[], string[], boolean, boolean, boolean, ColumnType[]>(getColumnData, [
        columns,
        disabled
    ]);

    const onLegendClick = (dataKey: string) =>
        changeDisabledLines(
            includes(dataKey, disabled) ? disabled.filter(obj => obj !== dataKey) : disabled.concat(dataKey)
        );

    const syncMethodFunction = (ticks, data) => {
        if (!sync) {
            return null;
        }

        return ticks.findIndex(({ value }) => new Date(value).getTime() === new Date(data.activeLabel).getTime());
    };

    const renderCharts = () => {
        return mapIndexed(
            (it, index) =>
                !isNullOrEmpty(data[index]) && (
                    <Box height={'100%'}>
                        <Box position={'absolute'} ml={'90px'} mt={'10px'} fontWeight={'bold'}>
                            {wellNames?.[index]}
                        </Box>
                        <Chart
                            key={index}
                            columns={columns}
                            data={data[index]}
                            disabled={disabled}
                            rangeXAxisDataKey='dt'
                            composed={!byWell}
                            syncId='multi-chart'
                            syncMethod={syncMethodFunction}
                        >
                            <XAxis dataKey='dt' tickFormatter={dt => ddmmyyyy(new Date(dt))} allowDataOverflow={true} />

                            {yAxisLeft('')}
                            {yAxisRight('')}

                            {isNullOrEmpty(referenceLines)
                                ? null
                                : map(
                                      (it: CorrelationItem) => (
                                          <>
                                              <ReferenceLine
                                                  key={`${it.startDate.getTime()}_0`}
                                                  yAxisId={'left'}
                                                  x={it.startDate.getTime()}
                                                  stroke={colors.colors.purple}
                                              />
                                              <ReferenceLine
                                                  key={`${it.startDate.getTime()}_1`}
                                                  yAxisId={'left'}
                                                  x={addMonth(
                                                      it.startDate,
                                                      monthDiff(it.startDate, it.endDate) / 2
                                                  ).getTime()}
                                                  stroke={opacity(colors.colors.purple, 0)}
                                                  label={{
                                                      position: 'top',
                                                      x: addMonth(it.startDate, 3).getTime(),
                                                      value: round2(it.value),
                                                      fill: colors.colors.purple,
                                                      dx: '3px'
                                                  }}
                                              />
                                              <ReferenceLine
                                                  key={`${it.endDate.getTime()}_2`}
                                                  yAxisId={'left'}
                                                  x={it.endDate.getTime()}
                                                  stroke={colors.colors.purple}
                                              />
                                          </>
                                      ),
                                      referenceLines
                                  )}

                            <Tooltip
                                labelFormatter={tooltipLabelFormatter}
                                content={
                                    <NameValueTooltip>
                                        {map(x => x.tooltip(), makeColumnData(true, false, true))}
                                    </NameValueTooltip>
                                }
                                isAnimationActive={false}
                            />

                            {!byWell && renderWellsStockBar(it, disabled)}

                            {renderParameterLines(showRepairs, makeColumnData)}
                        </Chart>
                    </Box>
                ),
            wells
        );
    };

    const renderAxisLegend = () => {
        return (
            <Box className={css.legend}>
                <Box className={css.leftItem}>{makeAxisLabel(columns, disabled, 'left')}</Box>
                <Spacer />
                <Box className={css.rightItem}>{makeAxisLabel(columns, disabled, 'right')}</Box>
            </Box>
        );
    };

    const filteredData = filter(it => !isNullOrEmpty(it), props.data) ?? [];

    return (
        <>
            {renderCharts()}
            {renderAxisLegend()}
            <DateRangeMultipleWrapper
                data={props.data}
                background={getDateRangeBg(makeColumnData(false, false, true), head(filteredData))}
                onChangeRange={setData}
            />
            <HorizontalLegend>
                {map(x => x.legend(disabled, onLegendClick), makeColumnData(false, false, true))}
            </HorizontalLegend>
        </>
    );
});

const getDateRangeBg = (columns: ColumnType[], data: WithDate[]): DateRangeProps<Range<Date>>['background'] => {
    const mainColumn = head(sortBy(prop('order'), columns));
    if (!mainColumn) {
        return { data: [], type: 'oil' };
    }

    return {
        data: map<WithDate, ParamDate>(x => ({ date: x.dt, value: x[mainColumn.key] }), data),
        type: mainColumn.wellType === WellTypeEnum.Injection ? 'injection' : 'oil'
    };
};
