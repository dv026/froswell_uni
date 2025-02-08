import React from 'react';

import { mergeRight, mergeDeepRight } from 'ramda';
import { Dot, Line, LineProps } from 'recharts';

import { DotProps } from '../../../../vendor/types/recharts';
import { cls } from '../../../helpers/styles';
import { getDot } from '../dots';
import { RepairsDot } from '../dots/repairsDot';

export const calc = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_calc']) });

export const real = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_real']) });

export const nameField = (name: string, props: LineProps): LineProps => mergeRight(props, { name });

export const leftAxis = (props: LineProps): LineProps => mergeRight(props, { yAxisId: 'left' });

export const rightAxis = (props: LineProps): LineProps => mergeRight(props, { yAxisId: 'right' });

export const pressure = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_pressure']) });

export const injection = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_injection']) });

export const liqrate = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_liqrate']) });

export const oilrate = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_oilrate']) });

export const watercut = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_watercut']) });

export const skinFactor = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_skinfactor']) });

export const bottomHolePressure = (props: LineProps): LineProps =>
    mergeRight(props, { className: cls([props.className, 'line_pressureBottomHole']) });

export const dot = (props: LineProps): LineProps => mergeRight(props, { dot: { className: 'line__dot', r: 6 } });

export const base = (
    dataKey: string,
    activeDotClass: string,
    color: string,
    dashed: boolean = false,
    withRepairs: boolean = false
): LineProps => ({
    activeDot: (dotProps: DotProps) => renderActiveDot(dotProps, activeDotClass),
    dot: getDot(
        withRepairs
            ? {
                  static: <RepairsDot isActive={false} dataKey={dataKey} />,
                  active: <RepairsDot isActive={true} dataKey={dataKey} />
              }
            : null,
        dataKey,
        true
    ),
    className: 'line',
    dataKey: dataKey,
    //dot: false,
    isAnimationActive: false,
    stroke: color,
    strokeWidth: 2,
    strokeDasharray: dashed ? '8 5' : undefined,
    type: 'monotone'
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const line = (p: LineProps): JSX.Element => <Line key={p.dataKey.toString()} {...p} ref={p.ref as any} />;

const renderActiveDot = (props: DotProps, activeDotClass: string) => {
    const newProps = { r: 5, className: cls(['line__dot_active', activeDotClass]) };
    const properties: DotProps = mergeDeepRight(props, newProps);

    // return <Dot {...properties} ref={properties.ref as LegacyRef<Dot> & LegacyRef<SVGCircleElement>} />;
    return <Dot {...properties} />;
};
