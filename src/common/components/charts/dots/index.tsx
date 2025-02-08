import React, { FC, ReactElement } from 'react';

import { both, complement, either, is, isNil } from 'ramda';
import { DotProps, LineProps } from 'recharts';

import { cls, StrOrArr } from '../../../helpers/styles';
import { ControlWithClassProps } from '../../customControl';

import css from './index.module.less';

type LineDotProps = Omit<DotProps, 'className'> & ControlWithClassProps;

// TIP: из-за особенностей структуры типов payload имеет тип any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LineDotWithPayloadProps = LineDotProps & { payload?: any; isInjection?: boolean };

/**
 * Предоставляет структуру для задания пользовательских точек на линии графика
 */
export interface CustomDots {
    /**
     * Компонент для отображения точки на линии графика
     */
    static: ReactElement;

    /**
     * Компонент для отображения активной точки на линии графика
     */
    active: ReactElement;
}

export type DotPropsOnLine = StrOrArr | CustomDots;

/**
 * Компонент, отобрающий "пустую" точку
 */
export const NoDot = () => null;

/**
 * Компонент, отображающий точку, состоящую только из окружности, без заполнения цветом
 */
export const HollowDot: FC<CustomDotProps> = ({ payload, dataKey, className, cx, cy }) =>
    !payload || !payload[dataKey] ? null : <Dot r={5} cx={cx} cy={cy} className={cls(className, css.dot_hollow)} />;

/**
 * Компонент, отображающий точку на графике
 */
export const SecondaryDot: FC<CustomDotProps> = ({ payload, dataKey, className, cx, cy }) =>
    !payload || !payload[dataKey] ? null : <Dot r={2} cx={cx} cy={cy} className={className} />;

/**
 * Компонент, отображающий точку, на которую наведен указатель мыши
 */
export const ActiveDot: FC<CustomDotProps> = ({ payload, dataKey, className, cx, cy }) =>
    !payload || !payload[dataKey] ? null : <Dot r={4} cx={cx} cy={cy} className={className} />;

/**
 * Проверяет, является ли переданный параметр парой кастомных компонентов для отображения точки на линии графика
 */
const areCustomDots = (p: DotPropsOnLine): p is CustomDots => both(is(Object), complement(is(Array)))(p);

/**
 * Проверяет, является ли переданный параметр классом-модификатором для базового отображения точки на линии графика
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const areClassesForDot = (p: DotPropsOnLine): p is StrOrArr => both(is(Object), either(is(Array), is(String)))(p);

type CustomDotProps = Omit<LineDotWithPayloadProps, 'r'> & { dataKey: string };

/**
 * Компонент, отображающий базовую точку на линии графика
 */
const Dot: FC<LineDotProps> = ({ cx, cy, r, className }) => (
    <circle cx={cx} cy={cy} r={r} className={cls(css.dot, className)} />
);

/**
 *
 * @param props
 * @param dataKey - на
 * @param isStatic - тип точки для отображения. True - точка, всегда отображаемая на линии графика. False - точка,
 *      отображаемая на линии графика только при наведении на нее
 */
export const getDot = (props: DotPropsOnLine, dataKey: string, isStatic: boolean): LineProps['dot'] => {
    if (isNil(props)) {
        // не отображать точку на линии графика
        return false;
    } else if (areCustomDots(props)) {
        // отобразить кастомный компонент точки
        return isStatic ? props.static : props.active;
    } else if (areClassesForDot(props)) {
        // отобразить базовый компонент точки с классами-модификаторами вида
        return isStatic ? (
            <SecondaryDot className={props} dataKey={dataKey} />
        ) : (
            <ActiveDot className={props} dataKey={dataKey} />
        );
    }

    throw new Error('unknown props');
};
