import React from 'react';

import i18n from 'i18next';
import { Bar, Line, YAxis } from 'recharts';

import colors from '../../../../../../theme/colors';
import { opacity } from '../../../../../common/helpers/colors';
import { round1 } from '../../../../../common/helpers/math';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const productionLine = (className: string, key: string, name: string, color: string): React.ReactNode => (
    <Line
        className={className}
        dataKey={key}
        dot={false}
        isAnimationActive={false}
        key={key}
        name={name}
        stroke={color}
        type='monotone'
        unit={i18n.t(dict.calculation.kiloM3) as string}
        yAxisId='right'
    />
);

export const bar = (className: string, key: string, name: string, color: string): React.ReactNode => (
    <Bar
        barSize={20}
        className={className}
        dataKey={key}
        isAnimationActive={false}
        key={key}
        name={name}
        stroke={color}
        fill={color}
        unit=' атм'
        yAxisId='left'
    />
);

export const avgOilPressureBar = bar(
    'bar bar_pressure',
    'oilWellsPressure',
    i18n.t(dict.calculation.avgPressureOilWells),
    colors.colors.yellow
);
export const avgInjPressureBar = bar(
    'bar bar_pressure-inj',
    'injWellsPressure',
    i18n.t(dict.calculation.avgPressureInjWells),
    opacity(colors.colors.blue, 0.2)
);
export const oilLine = productionLine('line line_oilrate', 'sumOil', 'Суммарная добыча нефти', colors.paramColors.oil);
export const liquidLine = productionLine(
    'line line_liqrate',
    'sumLiquid',
    i18n.t(dict.calculation.liquidProductionTotal) as string,
    colors.paramColors.liquid
);

export const productionAxisY = (
    <YAxis
        yAxisId='right'
        type='number'
        orientation='right'
        tickFormatter={(v: number) => round1(v).toString()}
        label={{
            value: i18n.t(dict.calculation.oilLiqProductionTotal) as string,
            angle: -90,
            position: 'insideRight'
        }}
    />
);

export const pressureAxisY = (
    <YAxis
        yAxisId='left'
        type='number'
        orientation='left'
        tickFormatter={(v: number) => round1(v).toString()}
        label={{
            value: i18n.t(dict.calculation.avgPressure) as string,
            angle: -90,
            position: 'insideLeft'
        }}
    />
);
