import React from 'react';

import { isNil } from 'ramda';

import { mmyyyy } from '../../../../../common/helpers/date';
import { DateLabelModel } from '../../../../entities/proxyMap/dateLabelModel';

interface DateLabelProps {
    model: DateLabelModel;
    x: number;
}

export const DateLabel: React.FC<DateLabelProps> = (props: DateLabelProps) => {
    if (isNil(props.model)) {
        return null;
    }

    const startDate = props.model.startDate ? <tspan className='green'>{mmyyyy(props.model.startDate)}</tspan> : null;
    const delimiter = props.model.startDate && props.model.closingDate ? <tspan>-</tspan> : null;
    const closingDate = props.model.closingDate ? (
        <tspan className='red'>{mmyyyy(props.model.closingDate)}</tspan>
    ) : null;

    return (
        <tspan className='bottom_title' textDecoration='overline' dy='1.2em' x={props.x}>
            {startDate}
            {delimiter}
            {closingDate}
        </tspan>
    );
};
