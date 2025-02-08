import React from 'react';

import { mergeRight } from 'ramda';

import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';

import css from './index.module.less';

export enum SeparatorTypeEnum {
    Vertical = 1,
    Horizontal = 2
}

interface Props extends ControlWithClassProps {
    type: SeparatorTypeEnum;
}

export const Separator: React.FC<Props> = ({ className, type }: Props) => (
    <div
        className={cls(
            css.separator,
            type === SeparatorTypeEnum.Horizontal ? css.separator_horizontal : css.separator_vertical,
            className
        )}
    />
);

export const HorizontalSeparator: React.FC<ControlWithClassProps> = (p: ControlWithClassProps) => (
    <Separator {...mergeRight(p, { type: SeparatorTypeEnum.Horizontal })} />
);
export const VerticalSeparator: React.FC<ControlWithClassProps> = (p: ControlWithClassProps) => (
    <Separator {...mergeRight(p, { type: SeparatorTypeEnum.Vertical })} />
);
