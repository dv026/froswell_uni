import React from 'react';

import { isNil } from 'ramda';

import { trueOrNull } from '../../../helpers/ramda';
import { cls, pc } from '../../../helpers/styles';

import css from '../wellRoster.module.less';

interface Props {
    label?: boolean;
    value?: number;
}

export const MapeInfo: React.FC<Props> = (p: Props) => (
    <div className={cls(css.mapeInfo, trueOrNull(p.label, css.mapeInfo_label))}>{text(p.label, p.value)}</div>
);

const text = (label: boolean, value: number) =>
    !!label ? 'mape' : isNil(value) || value === 0 ? '-' : pc(Math.round(value));
