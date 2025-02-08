import React from 'react';

import { WellProps } from '../../../../common/components/mapCanvas/wellProps';
import { WellLabel } from './wellLabel';

export const ImaginaryWell: React.FC<WellProps> = (props: WellProps) => (
    <g key={props.id} className='imaginary-well'>
        <WellLabel {...props} />
        <circle className='imaginary-well__center' r={50} cx={props.cx} cy={props.cy} />
    </g>
);
