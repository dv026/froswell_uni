import React, { ReactNode } from 'react';

import { YAxis } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import { round0 } from '../../../helpers/math';

export type AxisYCommon = 'left' | 'right';

export interface AxisLabelProps {
    position: 'insideLeft' | 'insideRight';
    value: string;
    angle: number;
}

const yAxis = (title: string, side: AxisYCommon, domain: AxisDomain = null): ReactNode => (
    <YAxis
        yAxisId={side}
        type='number'
        orientation={side}
        tickCount={8}
        allowDataOverflow={true}
        label={getAxisLabel(title, side)}
        domain={domain}
    />
);

export const yAxisLeft = (title: string): ReactNode =>
    yAxis(title, 'left', [0, dataMax => round0(dataMax + dataMax * 0.1)]);
export const yAxisRight = (title: string): ReactNode => yAxis(title, 'right', [0, dataMax => Math.max(100, dataMax)]);

export const getAxisLabel = (title: string, side: AxisYCommon): AxisLabelProps => ({
    value: title,
    angle: -90,
    position: side === 'left' ? 'insideLeft' : 'insideRight'
});
