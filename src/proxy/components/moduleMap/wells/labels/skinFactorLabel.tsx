import { equals, isNil } from 'ramda';
import React from 'react';

import { OptimizationLabel, OptimizationLabelProps } from './optimizationLabel';
import { delimiter } from './pressureZabLabel';

interface SkinFactorLabelProps extends OptimizationLabelProps {
    defaultValue?: number;
    value?: number;
}

export const SkinFactorLabel: React.FC<SkinFactorLabelProps> = (props: SkinFactorLabelProps) => {
    if (isNil(props.value) || equals(props.value, props.defaultValue)) {
        return null;
    }

    const currentValue =
        !isNil(props.value) && !equals(props.value, props.defaultValue) ? (
            <tspan fill='red'>{props.value}</tspan>
        ) : null;

    const defaultValue = !isNil(props.defaultValue) ? <tspan>{props.defaultValue}</tspan> : null;

    return (
        <OptimizationLabel x={props.x} id={props.id}>
            {defaultValue}
            {delimiter(defaultValue, currentValue)}
            {currentValue}
        </OptimizationLabel>
    );
};
