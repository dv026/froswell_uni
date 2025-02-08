import React, { Children, cloneElement, CSSProperties, FC, PureComponent, ReactElement } from 'react';

import { find, isNil } from 'ramda';
import { TooltipProps } from 'recharts';
import { Payload } from 'recharts/types/component/DefaultTooltipContent';

import { isFn, mapIndexed } from '../../../helpers/ramda';
import { cls, StrOrArr } from '../../../helpers/styles';

import css from './index.module.less';

type Props = TooltipProps<number, 'property'> & { children: ReactElement<NameValueTooltipLineProps>[] };

export class NameValueTooltip extends PureComponent<Props> {
    public render(): JSX.Element {
        if (!this.props.active) {
            return null;
        }

        const { label, labelFormatter, payload, children } = this.props;

        const childrenList = Children.toArray(children) as ReactElement[];

        return (
            <div className={css.tooltip}>
                <div className={css.tooltip__line}>
                    <div className={css.tooltip__label}>{isFn(labelFormatter) ? labelFormatter(label, []) : label}</div>
                </div>
                {mapIndexed((x: Payload<number, 'property'>) => {
                    const child: ReactElement = find(child => x.dataKey === child.props.dataKey, childrenList);

                    return child
                        ? cloneElement(child, { ...child.props, value: x.payload[child.props.dataKey] })
                        : null;
                }, payload ?? [])}
            </div>
        );
    }
}

export interface NameValueTooltipLineProps {
    dataKey: string;
    classes?: StrOrArr;
    title: string;
    value?: number;
    color?: string;
    formatter?: (x: number) => string;
}

export const NameValueTooltipLine: FC<NameValueTooltipLineProps> = ({ classes, title, value, color, formatter }) => {
    let style: CSSProperties = {};

    if (color) {
        style = { color: color || 'black' };
    }

    return (
        <div className={css.tooltip__line}>
            <div className={cls(css.param, classes)} style={style}>
                <div className={css.param__name}>{title}:</div>
                <div className={css.param__value}>{isFn(formatter) ? formatter(value) : formatFloat(value)}</div>
            </div>
        </div>
    );
};

type ParamNameValueTooltipLineProps = Omit<NameValueTooltipLineProps, 'classes'>;

export const OilTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_oil} {...props} />
);

export const LiquidTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_liquid} {...props} />
);

export const InjectionTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_injection} {...props} />
);

export const PressureTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_pressure} {...props} />
);

export const WatercutTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_watercut} {...props} />
);

export const GasTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_gas} {...props} />
);

export const DynamicLevelTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_dynLevel} {...props} />
);

export const StockTooltipLine: FC<ParamNameValueTooltipLineProps> = props => (
    <NameValueTooltipLine classes={css.param_stock} formatter={(x: number) => Math.round(x).toString()} {...props} />
);

const formatFloat = (x: number) => {
    if (isNil(x)) {
        return '-';
    }

    if (x === 0) {
        return '0';
    }

    return x.toFixed(2);
};
