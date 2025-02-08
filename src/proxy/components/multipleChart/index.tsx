/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useLayoutEffect, useState } from 'react';

import { Box, Spacer } from '@chakra-ui/react';
import { ChartDateRange } from 'common/components/chartDateRange';
import { renderTooltip } from 'proxy/subModules/results/components/chartData';
import { any, reject } from 'ramda';
import { AutoSizer } from 'react-virtualized';
import { CartesianGrid, LineChart, XAxis, YAxis } from 'recharts';

import { Range } from '../../../common/entities/range';
import { WellBrief } from '../../../common/entities/wellBrief';
import { round0 } from '../../../common/helpers/math';
import { mapIndexed } from '../../../common/helpers/ramda';
import { ChartViewData } from '../../subModules/results/entities/chartBuilder';

import css from './index.module.less';

interface MultipleChartProps {
    data: any[][];
    disabled: string[];
    initialRangeData: any[];
    showRepairs?: boolean;
    viewData: ChartViewData;
    wellNames?: string[];
    wells: WellBrief[];
    changeDisabledLines: (list: Array<string>) => void;
    onChangeRangeHandler: (current: Range<Date>) => void;
}

export const MultipleChart = memo((props: MultipleChartProps) => {
    const { initialRangeData, viewData, wells, wellNames = [], disabled, onChangeRangeHandler } = props;

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

    const renderLines = (lines: JSX.Element[]) => {
        return reject(x => any(hidden => hidden === (x as unknown as any).props.dataKey, disabled), lines);
    };

    const renderCharts = () => {
        return mapIndexed(
            (item: any, index: number) => (
                <Box height={'100%'}>
                    <Box position={'absolute'} ml={'90px'} mt={'10px'} fontWeight={'bold'}>
                        {wellNames?.[index]}
                    </Box>
                    <AutoSizer>
                        {({ width, height }) =>
                            width &&
                            height && (
                                <LineChart
                                    width={width}
                                    height={height}
                                    data={item}
                                    margin={{ top: 30, right: 30, left: 30, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray='1 0' vertical={false} stroke='#A6A6A6' />
                                    <XAxis dataKey='date' />
                                    <YAxis
                                        yAxisId='left'
                                        type='number'
                                        orientation='left'
                                        domain={viewData.domainRange}
                                        tickFormatter={viewData.tickFormatterLeft}
                                        label={null}
                                    />
                                    <YAxis
                                        yAxisId='right'
                                        type='number'
                                        orientation='right'
                                        domain={viewData.domainRangeRight}
                                        tickFormatter={(v: number) => round0(v).toString()}
                                        label={null}
                                    />
                                    {renderTooltip(viewData)}
                                    {renderLines(viewData.lines)}
                                </LineChart>
                            )
                        }
                    </AutoSizer>
                </Box>
            ),
            data
        );
    };

    const renderAxisLegend = () => {
        return (
            <Box className={css.legend}>
                <Box className={css.leftItem}>{viewData.yLeftAxisLabel}</Box>
                <Spacer />
                <Box className={css.rightItem}>{viewData.yRightAxisLabel}</Box>
            </Box>
        );
    };

    const renderChartRange = () => {
        return <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />;
    };

    const renderLegend = () => {
        return <Box>{viewData.legend.content()}</Box>;
    };

    return (
        <>
            {renderCharts()}
            {renderAxisLegend()}
            {renderChartRange()}
            {renderLegend()}
        </>
    );
});
