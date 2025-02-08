import { LegacyRef, ReactNode } from 'react';

import { Dot, DotProps as DotPropsBase } from 'recharts';
import { Formatter, NameType, TooltipType, ValueType } from 'recharts/src/component/DefaultTooltipContent';
import { PresentationAttributesWithProps } from 'recharts/types/util/types';

export type DotProps = PresentationAttributesWithProps<DotPropsBase, SVGCircleElement> &
    DotPropsBase & {
        ref?: LegacyRef<Dot> & LegacyRef<SVGCircleElement>;
    };

export interface TooltipPayload<TValue extends ValueType, TName extends NameType> {
    type?: TooltipType;
    color?: string;
    formatter?: Formatter<TValue, TName>;
    name?: TName;
    value?: TValue;
    unit?: ReactNode;
    dataKey?: string | number;
    payload?: any;
}
