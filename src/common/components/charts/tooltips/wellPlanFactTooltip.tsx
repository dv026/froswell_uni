import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { cls } from '../../../helpers/styles';
import { findPayloadValue, payloadValue } from './helpers';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface WellPlanFactTooltipProps extends TooltipProps<number, 'wellplanfact'> {
    className?: string;
    dataKeyWell: string;
    dataKeyCalc: string;
    dataKeyFact: string;
}

export class WellPlanFactTooltip extends React.PureComponent<WellPlanFactTooltipProps, null> {
    public render(): JSX.Element {
        const { active, className, dataKeyWell, dataKeyCalc, dataKeyFact, payload } = this.props;

        if (!active) {
            return null;
        }

        return (
            <div className={cls(['tooltip', 'tooltip_saturation', className])}>
                <div className='tooltip__row tooltip__row_title'>
                    <div className='tooltip__cell'>&nbsp;</div>
                    <div className='tooltip__cell tooltip__cell_label'>{R.head(payload)?.payload[dataKeyWell]}</div>
                </div>
                {this.renderCalc(payload, dataKeyCalc)}
                {this.renderFact(payload, dataKeyFact)}
            </div>
        );
    }

    private renderCalc(payload, key): JSX.Element {
        if (R.isNil(findPayloadValue(key, payload))) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_calc'>
                <div className='tooltip__cell tooltip__cell_label'>{i18n.t(dict.common.calc)}: </div>
                <div className='tooltip__cell'>{payloadValue(key, payload)}</div>
            </div>
        );
    }

    private renderFact(payload, key): JSX.Element {
        if (R.isNil(findPayloadValue(key, payload))) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_real'>
                <div className='tooltip__cell tooltip__cell_label'>{i18n.t(dict.common.fact)}: </div>
                <div className='tooltip__cell'>{payloadValue(key, payload)}</div>
            </div>
        );
    }
}
