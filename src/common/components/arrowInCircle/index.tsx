import React, { FC } from 'react';

import { always, cond, equals, ifElse, isNil, T } from 'ramda';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';
import { ArrowDownSmallIcon } from '../customIcon/general';
import { ArrowDownIcon, ArrowUpIcon } from '../customIcon/tree';

import css from './index.module.less';

export enum ArrowDirection {
    Bottom = 1,
    Right = 2,
    Left = 3,
    Top = 4
}

export enum ArrowType {
    Chevron = 1,
    Fill = 2
}

interface Props extends ControlWithClassProps {
    /**
     * Направление стрелки
     */
    direction?: ArrowDirection;

    /**
     * true - граница элемента не отображается,
     * false | null | undefined - граница элемента отображается
     */
    noBorder?: boolean;
    /**
     * Тип стрелки
     */
    type?: ArrowType;
}

export const ArrowInCircle: FC<Props> = ({
    className,
    direction,
    noBorder = false,
    type = ArrowType.Chevron
}: Props) => {
    return (
        <div className={makeCls(className, noBorder, direction)}>
            {type === ArrowType.Chevron ? (
                direction === ArrowDirection.Bottom ? (
                    <ArrowUpIcon color='icons.grey' boxSize={6} />
                ) : (
                    <ArrowDownIcon color='icons.grey' boxSize={6} />
                )
            ) : (
                <ArrowDownSmallIcon color='icons.grey' boxSize={7} />
            )}
        </div>
    );
};

const makeCls = (classname?: string[] | string, noBorder?: boolean, direction?: ArrowDirection) =>
    cls(css.aic, classname, directionCls(direction), trueOrNull(noBorder, css.aic_borderless));

const directionCls = (direction?: ArrowDirection) =>
    cond([
        [x => equals(ArrowDirection.Left, x), always(css.aic_left)],
        [x => equals(ArrowDirection.Top, x), always(css.aic_top)],
        [x => equals(ArrowDirection.Right, x), always(css.aic_right)],
        [T, always('')]
    ])(direct(direction));

const direct = (direction?: ArrowDirection) =>
    ifElse(isNil, always(ArrowDirection.Bottom), always(direction))(direction);
