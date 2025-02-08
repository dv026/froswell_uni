import React, { FC } from 'react';

import { DotProps } from 'recharts';

import colors from '../../../../../../theme/colors';
import { AdaptationDynamics } from '../../../../../calculation/entities/computation/calculationDetails';

const MAIN_COLOR = colors.colors.pink;

export const ErrorDot: FC<{ payload: AdaptationDynamics; cx: number; cy: number }> = props => {
    const { payload: dynamics, cx, cy } = props;

    return dynamics.isBest && <ErrorDotCircle cx={cx} cy={cy} fill></ErrorDotCircle>;
};

export const ErrorDotActive: FC<{ payload: AdaptationDynamics; cx: number; cy: number }> = props => {
    const { payload: dynamics, cx, cy } = props;

    return <ErrorDotCircle cx={cx} cy={cy} bold={dynamics.isBest}></ErrorDotCircle>;
};

type DotCirleProps = Pick<DotProps, 'cx' | 'cy'> & { fill?: boolean; bold?: boolean };

const ErrorDotCircle: FC<DotCirleProps> = ({ cx, cy, bold, fill }) => (
    <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke={MAIN_COLOR}
        strokeWidth={!!bold ? 2 : 1}
        fill={!!fill ? MAIN_COLOR : 'transparent'}
        color={MAIN_COLOR}
    ></circle>
);
