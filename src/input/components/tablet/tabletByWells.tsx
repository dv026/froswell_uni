import React, { FC } from 'react';

import { Flex } from '@chakra-ui/react';
import { AutoSizer } from 'react-virtualized';
import { Bar, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import { PropertyTooltip } from '../../../common/components/charts/tooltips/propertyTooltip';
import { round2 } from '../../../common/helpers/math';
import * as Prm from '../../../common/helpers/parameters';
import { dataByWellsSelector } from '../../store/tablet/tablet';

const tooltipFormatter = payload => round2(payload);

export const TabletByWells = () => {
    const dataByWells = useRecoilValue(dataByWellsSelector);

    const renderPlastTick = tickProps => {
        const { x, y, payload } = tickProps;
        const { value } = payload;

        if (value) {
            return (
                <text x={x} y={y + 4} fontSize={10} textAnchor='end'>
                    {value}
                </text>
            );
        }

        return null;
    };

    const heightChart = dataByWells.length * 15;

    return (
        <AutoSizer>
            {({ width, height }) =>
                width && height ? (
                    <Flex width={width} height={height} overflow='auto'>
                        <ResponsiveContainer width='100%' height={heightChart}>
                            <ComposedChart
                                layout='vertical'
                                width={500}
                                height={400}
                                data={dataByWells}
                                margin={{
                                    top: 20,
                                    bottom: 20,
                                    left: 40,
                                    right: 10
                                }}
                            >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis type='number' domain={[0, 100]} orientation={'top'} xAxisId={0} />
                                <XAxis type='number' domain={[0, 100]} orientation={'bottom'} xAxisId={1} />
                                <YAxis
                                    dataKey='wellPlastName'
                                    type='category'
                                    interval={0}
                                    tick={renderPlastTick}
                                    scale='auto'
                                />
                                <Tooltip
                                    content={<PropertyTooltip />}
                                    isAnimationActive={false}
                                    formatter={tooltipFormatter}
                                    label={null}
                                />
                                <Legend verticalAlign='top' />
                                <Legend verticalAlign='bottom' />
                                <Bar
                                    dataKey='partPefroration'
                                    name={Prm.perforatedPower()}
                                    barSize={20}
                                    fill='#B4C7E7'
                                    stroke='black'
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width='100%' height={heightChart}>
                            <ComposedChart
                                layout='vertical'
                                width={500}
                                height={400}
                                data={dataByWells}
                                margin={{
                                    top: 20,
                                    bottom: 20,
                                    left: 10,
                                    right: 10
                                }}
                            >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis type='number' orientation={'top'} xAxisId={0} />
                                <XAxis type='number' orientation={'bottom'} xAxisId={1} />
                                <YAxis dataKey='wellPlastName' type='category' interval={0} scale='auto' hide={true} />
                                <Tooltip
                                    content={<PropertyTooltip />}
                                    isAnimationActive={false}
                                    formatter={tooltipFormatter}
                                    label={null}
                                />
                                <Legend verticalAlign='top' />
                                <Legend verticalAlign='bottom' />
                                <Bar
                                    dataKey='permeability'
                                    name={Prm.permeability()}
                                    barSize={20}
                                    fill='#808080'
                                    stroke='black'
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width='100%' height={heightChart}>
                            <ComposedChart
                                layout='vertical'
                                width={500}
                                height={400}
                                data={dataByWells}
                                margin={{
                                    top: 20,
                                    bottom: 20,
                                    left: 10,
                                    right: 20
                                }}
                            >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis type='number' domain={[0, 100]} orientation={'top'} xAxisId={0} />
                                <XAxis type='number' domain={[0, 100]} orientation={'bottom'} xAxisId={1} />
                                <YAxis dataKey='wellPlastName' type='category' interval={0} scale='auto' hide={true} />
                                <Tooltip
                                    content={<PropertyTooltip />}
                                    isAnimationActive={false}
                                    formatter={tooltipFormatter}
                                    label={null}
                                />
                                <Legend verticalAlign='top' />
                                <Legend verticalAlign='bottom' />
                                <Bar
                                    dataKey='avgInflowProfile'
                                    name={Prm.averageInflowProfile()}
                                    barSize={20}
                                    fill='#78675A'
                                    stroke='black'
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Flex>
                ) : null
            }
        </AutoSizer>
    );
};
