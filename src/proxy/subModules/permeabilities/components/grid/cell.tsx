import React, { ReactNode } from 'react';

import * as R from 'ramda';

import { round } from '../../../../../common/helpers/math';
import { shallow } from '../../../../../common/helpers/ramda';
import { cls } from '../../../../../common/helpers/styles';

import css from './index.module.less';

interface CellProps<T> extends React.PropsWithChildren {
    className?: string | Array<string>;
    last?: boolean;
    value?: T;

    style?: React.CSSProperties;

    onClick?: () => void;
}

export class Cell<T> extends React.PureComponent<CellProps<T>, null> {
    public render(): JSX.Element {
        return (
            <div className={cls(this.cls())} style={this.props.style} onClick={this.props.onClick}>
                <>
                    {this.props.children}
                    {this.props.value}
                </>
            </div>
        );
    }

    private cls(): Array<string> {
        const baseCls = css.cell;
        const lastCls = css.cell_last;

        const base = [baseCls, !!this.props.last ? lastCls : null];

        return R.ifElse(Array.isArray, R.concat(base), x => R.append(x, base))(this.props.className);
    }
}

interface NumericCellProps extends CellProps<string | number> {
    nullValue?: string;
    round?: number;
    children?: JSX.Element | JSX.Element[];
}

export class NumericCell extends React.PureComponent<NumericCellProps, null> {
    public render(): JSX.Element {
        return <Cell {...this.properties()} />;
    }

    private properties(): NumericCellProps {
        return shallow<NumericCellProps>(this.props, {
            value: rnd(+this.props.value, this.props.round || 2, this.props.nullValue || '-')
        });
    }
}

/**
 * [
 *      number,     - отбор
 *      number      - закачка
 * ]
 */
export class LiquidCell extends React.PureComponent<CellProps<[number, number]>> {
    private readonly roundLevel = 2;

    public render(): JSX.Element {
        return <Cell {...this.properties()} />;
    }

    private properties(): CellProps<string> {
        const val = R.cond([
            [(x: [number, number]) => nullableOrZero(x[0]) && nullableOrZero(x[1]), R.always('0')],
            [(x: [number, number]) => x[0] > 0 && x[1] > 0, () => `${this.liqrate()} / ${this.injection()}`],
            [(x: [number, number]) => x[0] > 0, () => this.liqrate()],
            [(x: [number, number]) => x[1] > 0, () => this.injection()]
        ]);

        return R.mergeRight(this.props, { value: val(this.props.value) });
    }

    private liqrate(): string {
        return rnd(-1 * this.props.value[0], this.roundLevel, '0');
    }

    private injection(): string {
        return rnd(this.props.value[1], this.roundLevel, '0');
    }
}

const nullable = (x: number): boolean => R.anyPass([R.isNil, isNaN])(x);
const nullableOrZero = (x: number): boolean => R.anyPass([nullable, x => x === 0])(x);
const rnd = (val: number, roundLevel: number, nullValue: string): string =>
    R.cond([
        [nullable, R.always(nullValue)],
        [R.equals(Number.POSITIVE_INFINITY), R.always('+∞')],
        [R.equals(Number.NEGATIVE_INFINITY), R.always('-∞')],
        [() => R.lt(roundLevel, 1), y => y.toString()],
        [() => R.gte(roundLevel, 2), y => round(y, roundLevel).toString()]
    ])(val);
