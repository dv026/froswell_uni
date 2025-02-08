import React, { FC } from 'react';

import { Flex } from '@chakra-ui/react';
import { Bar, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import { PropertyTooltip } from '../../../common/components/charts/tooltips/propertyTooltip';
import { round2 } from '../../../common/helpers/math';
import * as Prm from '../../../common/helpers/parameters';
import { tabletData } from '../../store/tablet/tablet';

const tooltipFormatter = payload => round2(payload);

export const TabletByPlasts = () => {
    const model = useRecoilValue(tabletData);

    return (
        <Flex>
            <ResponsiveContainer width='100%' minHeight='400px'>
                <ComposedChart
                    layout='vertical'
                    width={500}
                    height={400}
                    data={model.dataByPlasts}
                    margin={{
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 10
                    }}
                >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' domain={[0, 100]} />
                    <YAxis dataKey='plastName' type='category' scale='auto' />
                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        formatter={tooltipFormatter}
                        label={null}
                    />
                    <Legend />
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
            <ResponsiveContainer width='100%' minHeight='400px'>
                <ComposedChart
                    layout='vertical'
                    width={500}
                    height={400}
                    data={model.dataByPlasts}
                    margin={{
                        top: 20,
                        bottom: 20,
                        left: 10,
                        right: 10
                    }}
                >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='plastName' type='category' scale='auto' hide={true} />
                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        formatter={tooltipFormatter}
                        label={null}
                    />
                    <Legend />
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
            <ResponsiveContainer width='100%' minHeight='400px'>
                <ComposedChart
                    layout='vertical'
                    width={500}
                    height={400}
                    data={model.dataByPlasts}
                    margin={{
                        top: 20,
                        bottom: 20,
                        left: 10,
                        right: 20
                    }}
                >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' domain={[0, 100]} />
                    <YAxis dataKey='plastName' type='category' scale='auto' hide={true} />
                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        formatter={tooltipFormatter}
                        label={null}
                    />
                    <Legend />
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
    );
};
