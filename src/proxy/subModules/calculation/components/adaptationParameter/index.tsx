import React from 'react';

import * as R from 'ramda';

import { DownSmallIcon, UpSmallIcon } from '../../../../../common/components/customIcon/actions';
import { round1, round2 } from '../../../../../common/helpers/math';
import { cls } from '../../../../../common/helpers/styles';

import css from './index.module.less';

interface AdaptationParameterProps {
    best: number;
    className?: string;
    current: number;
    diffInPercent: boolean;
    moreBetter: boolean;
    text: string;
}

export const AdaptationParameter: React.FC<AdaptationParameterProps> = (props: AdaptationParameterProps) => {
    const equalsToBest = () => R.either(R.isNil, R.equals(props.current))(props.best);

    const hasBest = () => R.not(R.isNil(props.best));

    const rate = (left, right) => (props.diffInPercent ? Math.abs((right * 100) / left - 100) : Math.abs(right - left));

    const diff = () => R.ifElse(equalsToBest, R.always(0), () => rate(props.best, props.current))(props.best);

    const lineType = () => {
        if (equalsToBest()) {
            return LineType.Neutral;
        }

        if (props.moreBetter) {
            return props.best > props.current ? LineType.Bad : LineType.Good;
        }

        return props.best > props.current ? LineType.Good : LineType.Bad;
    };

    const lineDirection = () => {
        if (equalsToBest()) {
            return LineDirection.Unknown;
        }

        return props.current > props.best ? LineDirection.Up : LineDirection.Down;
    };

    const arr = (): JSX.Element =>
        hasBest() && !equalsToBest() ? (
            <Arrow
                className={css.aParam__arrow}
                direction={lineDirection()}
                type={lineType()}
                text={`${round2(diff())}%`}
            />
        ) : null;

    const className = () => cls([css.aParam, props.className]);

    return (
        <div className={className()}>
            <div className={css.aParam__name}>{props.text}</div>
            <div className={css.aParam__value}>
                {round1(props.current)} {arr()}
            </div>
        </div>
    );
};

enum LineType {
    Good = 1,
    Bad = 2,
    Neutral = 3
}

enum LineDirection {
    Up = 1,
    Down = 2,
    Unknown = 3
}

interface ArrowProps {
    className?: string;
    direction: LineDirection;
    text: string;
    type: LineType;
}

const Arrow: React.FC<ArrowProps> = (props: ArrowProps) => {
    const typeCls = () =>
        R.cond([
            [R.equals(LineType.Good), R.always(css.aArrow_good)],
            [R.equals(LineType.Bad), R.always(css.aArrow_bad)],
            [R.equals(LineType.Neutral), R.always('')]
        ])(props.type);

    const glyphIcon = () =>
        R.cond([
            [R.equals(LineDirection.Up), R.always(<UpSmallIcon boxSize={6} />)],
            [R.equals(LineDirection.Down), R.always(<DownSmallIcon boxSize={6} />)],
            [R.T, R.always(<></>)]
        ])(props.direction);

    return (
        <div className={cls([props.className, css.aArrow, typeCls()])}>
            (<span>{props.text || ''}</span>
            {glyphIcon()})
        </div>
    );
};
