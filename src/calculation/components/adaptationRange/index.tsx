import React, { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';

import { formatLabel } from 'common/components/dateRangeNew';
import { Area, AreaChart } from 'recharts';

import colors from '../../../../theme/colors';
import { ControlWithClassProps } from '../../../common/components/customControl';
import { ParamDate } from '../../../common/entities/paramDate';
import { Range } from '../../../common/entities/range';
import { opacity } from '../../../common/helpers/colors';
import { cls } from '../../../common/helpers/styles';
import { RangeChartLegend } from '../rangeChartLegend';

import css from './index.module.less';

type BackgroundType = 'oil' | 'injection';

export interface DateRangeProps extends ControlWithClassProps {
    background?: {
        data: ParamDate[];
        type: BackgroundType;
    };
    disabled?: boolean;
    limits: Range<Date>;
}

export const AdaptationRange: FC<PropsWithChildren<DateRangeProps>> = (p: PropsWithChildren<DateRangeProps>) => {
    const [elWidth, setElWidth] = useState<number>(0);
    const [elHeight, setElHeight] = useState<number>(0);
    const bgEl = useRef(null);

    useEffect(() => {
        // todo mb
        setTimeout(() => {
            setElWidth(bgEl.current?.clientWidth ?? 0);
            setElHeight(bgEl.current?.clientHeight ?? 0);
        }, 100);
    }, [bgEl.current?.clientHeight, bgEl.current?.clientWidth]);

    return (
        <div className={cls(css.daterange, p.disabled && css.daterange_disabled, p.className)}>
            <div className={css.daterange__bg} ref={bgEl}>
                {p.background && (
                    <AreaChart
                        height={elHeight}
                        width={elWidth}
                        data={p.background.data}
                        margin={{ top: 0, left: 0, bottom: 0, right: 0 }}
                    >
                        <Area
                            type='monotone'
                            dataKey='value'
                            stroke={p.background.type === 'oil' ? colors.paramColors.oil : colors.paramColors.injection}
                            fill={opacity(
                                p.background.type === 'oil' ? colors.paramColors.oil : colors.paramColors.injection,
                                0.1
                            )}
                            isAnimationActive={false}
                            dot={false}
                            activeDot={false}
                        />
                        <Area
                            type='monotone'
                            dataKey='valueOrig'
                            stroke={p.background.type === 'oil' ? colors.paramColors.oil : colors.paramColors.injection}
                            strokeDasharray='5 3'
                            fill='none'
                            isAnimationActive={false}
                            dot={false}
                            activeDot={false}
                        />
                    </AreaChart>
                )}
            </div>
            <div className={cls(css.daterange__edge)}>
                <div className={css.daterange__label}>
                    <div className={css.daterange__labelInner}>{formatLabel(p.limits.min.getTime())}</div>
                </div>
            </div>
            <div className={cls(css.daterange__edge, css.daterange__edge_max)}>
                <div className={css.daterange__label}>
                    <div className={css.daterange__labelInner}>{formatLabel(p.limits.max.getTime())}</div>
                </div>
            </div>
            <RangeChartLegend />
            {p.children}
        </div>
    );
};
