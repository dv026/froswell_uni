import * as R from 'ramda';
import React from 'react';

import { BaseInjWell } from './baseInjWell';
import { WellLabel } from './wellLabel';
import { WellPointProps } from './wellPointProps';

export const InjWell: React.FC<WellPointProps> = (props: WellPointProps) => {
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
        <g key={props.id} {...tooltip}>
            <BaseInjWell {...p} />
            <WellLabel {...props} />
        </g>
    );
};
