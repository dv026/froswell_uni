import React from 'react';

import { isNullOrEmpty, trueOrNull } from '../../../helpers/ramda';
import { cls, pc } from '../../../helpers/styles';
import { ControlWithClassProps } from '../../customControl';

import css from './scales.module.less';

type Props = React.PropsWithChildren<ControlWithClassProps>;

export const Scales: React.FC<Props> = (p: Props) => <div className={cls(css.scales, p.className)}>{p.children}</div>;

export interface WeightData {
    percent: number;
    title?: string;
}

interface WeightProps extends ControlWithClassProps {
    data: WeightData;
}

export const Weight: React.FC<WeightProps> = (p: WeightProps) => (
    <div
        className={cls(css.scales__weight, p.className)}
        style={{ width: pc(p.data.percent) }}
        title={trueOrNull(!isNullOrEmpty(p.data.title), p.data.title)}
    />
);
