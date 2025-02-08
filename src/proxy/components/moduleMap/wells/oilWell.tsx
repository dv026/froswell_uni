import * as R from 'ramda';
import React from 'react';

import { BaseOilWell } from './baseOilWell';
import { OilWellProps } from './oilWellProps';
import { WellLabel } from './wellLabel';

export const OilWell: React.FC<OilWellProps> = (props: OilWellProps) => {
    const p = R.mergeDeepRight(props, { title: null });

    let tooltip = {};
    if (props.isImaginary) {
        tooltip = {
            'data-for': 'status-tooltip',
            'data-tip': props.id,
            'data-event': 'click focus'
        };
    }

    return (
        <g key={props.id} className='oil-well' {...tooltip}>
            <WellLabel {...props} />
            <BaseOilWell {...p} />
        </g>
    );
};
