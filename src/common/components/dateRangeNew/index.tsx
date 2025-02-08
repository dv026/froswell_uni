import React, { FC, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
    Box,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack
} from '@chakra-ui/react';
import { ifElse, is, isNil } from 'ramda';
import { AutoSizer } from 'react-virtualized';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import colors from '../../../../theme/colors';
import { ParamDate } from '../../entities/paramDate';
import { Range } from '../../entities/range';
import { opacity } from '../../helpers/colors';
import { isValidDate, mmyyyy } from '../../helpers/date';
import { limit } from '../../helpers/math';
import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '../customIcon/general';

import css from './index.module.less';

type DateRangeSize = 'xxs' | 'xs' | 's' | 'md';

type DateRangeOffset = 'top' | 'bottom';

export type BackgroundType = 'oil' | 'injection';

export interface DateRangeProps<T extends Range<Date> | Date> extends ControlWithClassProps {
    background?: {
        data: ParamDate[];
        type: BackgroundType;
    };
    disabled?: boolean;
    limits: Range<Date>;
    current?: T;
    isRange: boolean;
    onChange: (val: T) => void;
    showEdges?: {
        min: boolean;
        max: boolean;
    };
    size?: DateRangeSize;
    offset?: DateRangeOffset;
}

export const DateRangeNew: FC<PropsWithChildren<DateRangeProps<Range<Date> | Date>>> = <T extends Range<Date> | Date>(
    p: PropsWithChildren<DateRangeProps<T>>
) => {
    const size: DateRangeSize = p.size ?? 'md';

    const [value, setValue] = useState<number[] | number>(getDefaultValue(p.current, p.isRange, p.limits));
    const bgEl = useRef(null);

    const showEdges = p.showEdges ?? { min: false, max: false };

    useLayoutEffect(() => {
        setValue(getDefaultValue(p.current, p.isRange, p.limits));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- зависимости указаны правильно
    }, [p.current, p.isRange, p.limits]);

    return (
        <div
            className={cls(
                css.daterange,
                p.disabled && css.daterange_disabled,
                p.className,
                // elHeight < 80 && size !== 'xs' && css.daterange_narrow,
                size === 'xxs' && css.daterange_xxs,
                size === 'xs' && css.daterange_xs,
                size === 's' && css.daterange_s,
                p.offset && p.offset === 'top' && css.daterange_offsetTop,
                p.offset && p.offset === 'bottom' && css.daterange_offsetBottom
            )}
        >
            <div className={css.daterange__bg} ref={bgEl}>
                {p.background ? (
                    <ResponsiveContainer>
                        <AutoSizer>
                            {({ width, height }) =>
                                width && height ? (
                                    <AreaChart
                                        height={height}
                                        width={width}
                                        data={p.background?.data}
                                        margin={{ top: 0, left: 0, bottom: 0, right: 0 }}
                                    >
                                        <Area
                                            type='monotone'
                                            dataKey='value'
                                            stroke={colors.paramColors.oil}
                                            fill={opacity(
                                                p.background?.type === 'oil'
                                                    ? colors.paramColors.oil
                                                    : colors.paramColors.injection,
                                                0.1
                                            )}
                                            isAnimationActive={false}
                                            dot={false}
                                            activeDot={false}
                                        />
                                        <Area
                                            type='monotone'
                                            dataKey='valueOrig'
                                            stroke={
                                                p.background?.type === 'oil'
                                                    ? colors.paramColors.oil
                                                    : colors.paramColors.injection
                                            }
                                            strokeDasharray='5 3'
                                            fill='none'
                                            isAnimationActive={false}
                                            dot={false}
                                            activeDot={false}
                                        />
                                    </AreaChart>
                                ) : null
                            }
                        </AutoSizer>
                    </ResponsiveContainer>
                ) : null}
            </div>
            {p.isRange ? (
                <RangeSlider
                    position={'initial'}
                    value={setInLimits(value, p.limits) as number[]}
                    min={toNum(p.limits.min)}
                    max={toNum(p.limits.max)}
                    step={3.8052e-10}
                    onChange={setValue}
                    onChangeEnd={x => p.onChange(fromNumeric(x))}
                    height={'100%'}
                >
                    <RangeSliderTrack className={css.daterange__track}>
                        <RangeSliderFilledTrack bg='rgba(29, 60, 172, 0.1)' borderLeft='2px' borderRight='2px' />
                    </RangeSliderTrack>
                    <RangeSliderThumb
                        index={0}
                        sx={{
                            _active: {
                                transform: 'translateY(-50%) scale(1)'
                            }
                        }}
                    >
                        {showEdges.min && (
                            <div className={cls(css.daterange__edge, css.daterange__edge_min)}>
                                <div className={css.daterange__label}>
                                    <div className={css.daterange__labelInner}>{formatLabel(value[0])}</div>
                                </div>
                            </div>
                        )}
                        <ArrowRightIcon boxSize={8} />
                    </RangeSliderThumb>
                    <RangeSliderThumb
                        index={1}
                        sx={{
                            _active: {
                                transform: 'translateY(-50%) scale(1)'
                            }
                        }}
                    >
                        {showEdges.max && (
                            <div className={cls(css.daterange__edge, css.daterange__edge_max)}>
                                <div className={css.daterange__label}>
                                    <div className={css.daterange__labelInner}>{formatLabel(value[1])}</div>
                                </div>
                            </div>
                        )}
                        <ArrowLeftIcon boxSize={8} />
                    </RangeSliderThumb>
                </RangeSlider>
            ) : (
                <Slider
                    position={'initial'}
                    value={setInLimits(value, p.limits) as number}
                    min={toNum(p.limits.min)}
                    max={toNum(p.limits.max)}
                    step={3.8052e-10}
                    onChange={setValue}
                    onChangeEnd={x => p.onChange(fromNumeric(x))}
                    height={'100%'}
                >
                    <SliderTrack className={css.daterange__track}>
                        <SliderFilledTrack bg='rgba(29, 60, 172, 0.1)' borderRight='2px' />
                    </SliderTrack>
                    <SliderThumb
                        top='-12px'
                        sx={{
                            _active: {
                                transform: 'translateY(-50%) scale(1.05)'
                            }
                        }}
                    >
                        <div className={cls(css.daterange__edge)}>
                            <div className={css.daterange__label}>
                                <div className={css.daterange__labelInner}>{formatLabel(value as number)}</div>
                            </div>
                        </div>
                        <ArrowDownIcon boxSize={8} />
                    </SliderThumb>
                </Slider>
            )}
            {p.children}
        </div>
    );
};

export const formatLabel = (value: number): string => mmyyyy(new Date(value));

const toRange = (val: number[]) => new Range<Date>(new Date(val[0]), new Date(val[1]));
export const toDate = (val: number): Date => new Date(val);
export const fromNumeric = <T extends Range<Date> | Date>(val: number[] | number): T =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ifElse(is(Object), toRange, toDate)(val);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const toNumeric = (val: Range<Date> | Date): number | number[] => ifElse(is(Date), toNum, toNumRange)(val);
const toNumRange = (x: Range<Date>): number[] => [toNum(x.min), toNum(x.max)];
export const toNum = (x: Date): number => (isValidDate(x) ? x.getTime() : 0);

export const getDefaultValue = (val: Range<Date> | Date, isRange: boolean, limits: Range<Date>): number | number[] =>
    isNil(val) ? (isRange ? toNumeric(limits) : toNum(limits.max)) : toNumeric(val);

export const setInLimits = <T extends number[] | number>(val: T, limits: Range<Date>): T =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ifElse(
        is(Number),
        (x: number) => setDateInLimits(x, limits),
        (x: number[]) => setRangeInLimits(x, limits)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )(val as any);

const setRangeInLimits = (val: number[], limits: Range<Date>): number[] => [
    limit(toNum(limits.min), toNum(limits.max), val[0]),
    limit(toNum(limits.min), toNum(limits.max), val[1])
];

const setDateInLimits = (val: number, limits: Range<Date>): number => limit(toNum(limits.min), toNum(limits.max), val);
