import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { valueProp } from '../../../helpers/strings';
import { cls } from '../../../helpers/styles';
import { findPayloadValue, payloadValue } from './helpers';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface QuantilesTooltipProps extends TooltipProps<number, 'quantile'> {
    className?: string;
    showMissedKeys?: boolean;
}

export class QuantilesTooltip extends React.PureComponent<QuantilesTooltipProps, null> {
    public render(): JSX.Element {
        if (!this.props.active) {
            return null;
        }

        const payload = this.props.payload;

        return (
            <div className={cls(['tooltip', this.props.className])}>
                <div className='tooltip__row tooltip__row_title'>
                    <div className='tooltip__cell'>&nbsp;</div>
                    <div className='tooltip__cell tooltip__cell_label'>{this.props.label} </div>
                </div>
                {R.map(x => this.renderQuantile(x[0], payload as unknown[], x[1]), quantiles())}
                {this.renderCalc(payload)}
                {this.renderFact(payload)}
            </div>
        );
    }

    private renderCalc(payload): JSX.Element {
        if (R.isNil(findPayloadValue(valueProp('calc'), payload) && !this.props.showMissedKeys)) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_calc'>
                <div className='tooltip__cell tooltip__cell_label'>{i18n.t(dict.common.calc)}: </div>
                <div className='tooltip__cell'>{payloadValue('value_calc', payload)}</div>
            </div>
        );
    }

    private renderFact(payload): JSX.Element {
        if (R.isNil(findPayloadValue(valueProp('real'), payload) && !this.props.showMissedKeys)) {
            return null;
        }

        return (
            <div className='tooltip__row tooltip__row_real'>
                <div className='tooltip__cell tooltip__cell_label'>{i18n.t(dict.common.fact)}: </div>
                <div className='tooltip__cell'>{payloadValue('value_real', payload)}</div>
            </div>
        );
    }

    private renderQuantile(postfix: string, payload: unknown[], title: string): JSX.Element {
        if (R.isNil(findPayloadValue(valueProp(postfix), payload))) {
            return null;
        }

        return (
            <div key={postfix} className={cls(['tooltip__row', `tooltip__row_${postfix}`])}>
                <div className='tooltip__cell tooltip__cell_label'>{title}: </div>
                <div className='tooltip__cell'>{payloadValue(valueProp(postfix), payload)}</div>
            </div>
        );
    }
}

const quantiles = () => [
    ['p10', 'P10'],
    ['p50', 'P50'],
    ['p90', 'P90']
];
