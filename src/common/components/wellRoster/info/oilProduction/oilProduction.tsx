import React from 'react';

import i18n from 'i18next';

import { round1 } from '../../../../helpers/math';
import { isCorrectNumber } from '../../../../helpers/ramda';

import css from './oilProduction.module.less';

import dict from '../../../../helpers/i18n/dictionary/main.json';

interface Props {
    value: number;
}

export const OilProduction: React.FC<Props> = ({ value }: Props) => (
    <div className={css.oilTotal}>
        <div className={css.oilTotal__value}>{val(value)}</div>
        {isCorrectNumber(value) ? (
            <div className={css.oilTotal__unit}>{i18n.t(dict.common.units.tonsAccumulated)}</div>
        ) : null}
    </div>
);

const val = (value: number) => (isCorrectNumber(value) ? `${round1(value)}` : '');
