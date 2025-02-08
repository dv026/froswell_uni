import React from 'react';

export interface OptimizationLabelProps {
    id: number;
    x: number;
}

export const OptimizationLabel: React.FC<React.PropsWithChildren<OptimizationLabelProps>> = (
    props: React.PropsWithChildren<OptimizationLabelProps>
) => (
    <tspan
        className='bottom_title'
        textDecoration='overline'
        x={props.x}
        dy='1.2em'
        data-for='optimisation-tooltip'
        data-tip={props.id}
    >
        {props.children}
    </tspan>
);
