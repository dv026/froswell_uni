import { equals, isNil } from 'ramda';
import React from 'react';

import { OptimizationLabel, OptimizationLabelProps } from './optimizationLabel';

interface PressureZabLabelProps extends OptimizationLabelProps {
    defaultValue?: number;
    value?: number;
}

export const PressureZabLabel: React.FC<PressureZabLabelProps> = (props: PressureZabLabelProps) => {
    const currentValue =
        !isNil(props.value) && !equals(props.value, props.defaultValue) ? (
            <tspan fill='red'>{`${props.value} атм`}</tspan>
        ) : null;

    const defaultValue =
        !isNil(props.defaultValue) && !equals(0, props.defaultValue) ? <tspan>{`${props.defaultValue}`}</tspan> : null;

    return (
        <OptimizationLabel x={props.x} id={props.id}>
            {defaultValue}
            {delimiter(defaultValue, currentValue)}
            {currentValue}
        </OptimizationLabel>
    );
};

export const delimiter = (defaultValue: unknown, currentValue: unknown): React.ReactNode =>
    defaultValue && currentValue ? <tspan>/</tspan> : null;
