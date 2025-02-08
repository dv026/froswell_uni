import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { TooltipProps } from 'recharts';

import { payloadValue } from '../../../../common/components/charts/tooltips/helpers';
import { ParamNameEnum } from '../../../../common/enums/paramNameEnum';
import { UnitsEnum } from '../../../../common/enums/unitsEnum';
import * as Prm from '../../../../common/helpers/parameters';
import { cls } from '../../../../common/helpers/styles';
import { ddmmyyyy } from '../../../helpers/date';
import { round1, round2 } from '../../../helpers/math';
import { isNumber } from '../../../helpers/types';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface PropertyPlanFactProps extends TooltipProps<number, 'planfact'> {
    keysToShow: string[];
    accumulated?: boolean;
}

const names = (accumulated: boolean) => ({
    oilrate: Prm.oilrate(
        accumulated ? ParamNameEnum.OilProduction : ParamNameEnum.OilRate,
        accumulated ? UnitsEnum.TonsAccumulated : undefined
    ),
    liqrate: Prm.liqrate(
        accumulated ? ParamNameEnum.LiqProduction : ParamNameEnum.LiqRate,
        accumulated ? UnitsEnum.M3Accumulated : undefined
    ),
    pressure: Prm.pressureRes(),
    injection: Prm.injectionRate(ParamNameEnum.InjectionRate, accumulated ? UnitsEnum.M3Accumulated : undefined),
    watercut: Prm.watercut(),
    skinfactor: Prm.skinFactor(),
    pressureBottomHole: Prm.pressureZab(),
    stock: i18n.t(dict.common.wellFund)
});

export class PropertyPlanFact extends React.PureComponent<PropertyPlanFactProps> {
    public render(): JSX.Element {
        if (!this.props.active) {
            return null;
        }

        const payload = this.props.payload;

        return (
            <div className='tooltip tooltip_properties'>
                <div className='tooltip__row'>
                    <div className='tooltip__cell tooltip__cell_label'>
                        {typeof this.props.label.getMonth === 'function'
                            ? ddmmyyyy(this.props.label)
                            : this.props.label}
                    </div>
                    <div className='tooltip__cell'>{i18n.t(dict.common.fact)}</div>
                    <div className='tooltip__cell'>{i18n.t(dict.common.calc)}</div>
                    <div className='tooltip__cell tooltip__cell_deviation'>{i18n.t(dict.common.deviation)}</div>
                </div>
                {R.map((x: string) => this.renderProperty(x, payload), R.reject(R.isNil, this.props.keysToShow))}

                {this.renderWellsInWork(payload)}
            </div>
        );
    }

    private renderProperty(key: string, payload): JSX.Element {
        if (key === 'stock') {
            return null;
        } // TODO: убрать хардкод

        const n = names(!!this.props.accumulated);
        return (
            <div key={key} className={makeRowClass(key)}>
                <div className='tooltip__cell tooltip__cell_label'>{n[key] || '-'}</div>
                <div className='tooltip__cell'>{payloadValue(payloadProp(key, true), payload)}</div>
                <div className='tooltip__cell'>{payloadValue(payloadProp(key, false), payload)}</div>
                <div className='tooltip__cell tooltip__cell_deviation'>{deviationValue(key, payload)}</div>
            </div>
        );
    }

    private renderWellsInWork(payload): JSX.Element {
        const key = 'stock';
        if (!showProp(key, this.props.keysToShow)) {
            return null;
        }

        return (
            <div className={makeRowClass(key)}>
                <span>{i18n.t('common.wellsInWork', { value: payloadValue(key, payload) })}</span>
            </div>
        );
    }
}

const showProp = (prop: string, propsToShow: string[]) => R.any(x => x === prop, propsToShow);

const payloadProp = (key: string, isReal: boolean) => `${key}${isReal ? 'Real' : 'Calc'}`;

const makeRowClass = (key: string) => cls(['tooltip__row', `tooltip__row_${key}`]);

const deviationValue = (key: string, payload) => {
    const real = payloadValue(payloadProp(key, true), payload);
    const calc = payloadValue(payloadProp(key, false), payload);

    if (!isNumber(real) || !isNumber(calc) || (calc === 0 && real === 0)) {
        return null;
    }

    const dev = calc - real;

    return `${round2(dev)} (${round1((dev / real) * 100)}%)`;
};
