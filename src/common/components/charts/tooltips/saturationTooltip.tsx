import React from 'react';

import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { valueProp } from '../../../../proxy/subModules/results/entities/chartBuilder';
import { mmyyyy } from '../../../helpers/date';
import { round2 } from '../../../helpers/math';
import { cls } from '../../../helpers/styles';
import { findPayloadValue, payloadValue } from './helpers';

interface SaturationTooltipProps extends TooltipProps<number, 'saturation'> {
    dateLabel?: boolean;
}

export class SaturationTooltip extends React.PureComponent<SaturationTooltipProps, null> {
    public render(): JSX.Element {
        if (!this.props.active) {
            return null;
        }

        const payload = this.props.payload;

        return (
            <div className={cls('tooltip', 'tooltip_saturation')}>
                <div className='tooltip__row tooltip__row_title'>
                    <div className='tooltip__cell'>&nbsp;</div>
                    <div className='tooltip__cell tooltip__cell_label'>
                        {this.props.dateLabel && this.props.label
                            ? mmyyyy(new Date(this.props.label))
                            : round2(this.props.label as number)}
                    </div>
                </div>
                {this.renderNotApproximated(payload)}
                {this.renderFront(payload)}
            </div>
        );
    }

    private renderNotApproximated(payload): JSX.Element {
        if (R.isNil(findPayloadValue(valueProp('notApproximatedSaturation'), payload))) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_calc'>
                <div className='tooltip__cell tooltip__cell_label'>NotApproximated: </div>
                <div className='tooltip__cell'>{payloadValue(valueProp('notApproximatedSaturation'), payload)}</div>
            </div>
        );
    }

    private renderFront(payload): JSX.Element {
        if (R.isNil(findPayloadValue(valueProp('frontSaturation'), payload))) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_real'>
                <div className='tooltip__cell tooltip__cell_label'>FrontSaturation: </div>
                <div className='tooltip__cell'>{payloadValue(valueProp('frontSaturation'), payload)}</div>
            </div>
        );
    }
}
