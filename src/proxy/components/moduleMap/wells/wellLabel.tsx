import React from 'react';

import { DateLabel } from './labels/dateLabel';
import { WellPointProps } from './wellPointProps';

export const WellLabel: React.FC<WellPointProps> = (props: WellPointProps) => {
    const { id, cx, cy, title, dateLabelModel } = props;
    const offset = 250;
    const step = 100;

    const shortTitleStyle = {
        display: 'none'
    };

    return (
        <g key={id} className='well-label' transform='translate(100)'>
            <text
                className='well-label__title top_short_title'
                style={shortTitleStyle as React.CSSProperties}
                x={cx + offset}
                y={cy - step - 50}
            >
                {title}
            </text>
            <text className='well-label__title top_title' x={cx + offset} y={cy - step} fontFamily={'Roboto'}>
                <tspan>{title}</tspan>
                <DateLabel model={dateLabelModel} x={cx + offset} />
            </text>
        </g>
    );
};
