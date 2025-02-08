import React, { FC, useEffect, useState } from 'react';

import { DateRangeNew } from 'common/components/dateRangeNew';
import i18n from 'i18next';
import { always, any, cond, curry, equals, find, head, ifElse, last, map, pipe, range, sortBy, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import { SaturationTooltip } from '../../../../../common/components/charts/tooltips/saturationTooltip';
import { Rect } from '../../../../../common/entities/canvas/rect';
import { Range } from '../../../../../common/entities/range';
import { UnitsEnum } from '../../../../../common/enums/unitsEnum';
import { WellTypeEnum } from '../../../../../common/enums/wellTypeEnum';
import { addDay, firstDay } from '../../../../../common/helpers/date';
import { round2 } from '../../../../../common/helpers/math';
import { nul } from '../../../../../common/helpers/ramda';
import { cls } from '../../../../../common/helpers/styles';
import { DateSaturation, DistanceSaturation } from '../../../../entities/frontTracking/frontTracking';
import { FrontTrackingBoundaries } from '../../../../entities/frontTracking/frontTrackingBoundaries';
import { valueProp } from '../../entities/chartBuilder';
import { frontTrackingSelector } from '../../store/frontTracking';
import { frontTrackingBoundaries } from '../../store/frontTrackingBoundaries';
import { interwellTypesSelector } from '../../store/interwellTypes';
import { baseLine } from './helpers';

import commonCss from './../common.module.less';
import css from './index.module.less';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export interface Props {
    neighborId: number;
    plastId: number;
}

export const FrontTrackingChart: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const frontTracking = useRecoilValue(frontTrackingSelector({ neighborId: p.neighborId, plastId: p.plastId }));
    const boundaries = useRecoilValue(frontTrackingBoundaries(p.plastId));
    const interwellTypes = useRecoilValue(interwellTypesSelector(p.neighborId));

    const [currentDate, setCurrentDate] = useState<Date>(null);
    const [rect, setRect] = useState<Rect>(null);

    const gridEl = React.createRef<CartesianGrid>();

    useEffect(() => {
        setCurrentDate(head(frontTracking || [])?.date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setCurrentDate(head(frontTracking || [])?.date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.neighborId, p.plastId]);

    useEffect(() => {
        const minDate = head(frontTracking || [])?.date;
        const maxDate = last(frontTracking || [])?.date;
        if (!maxDate || currentDate > maxDate) {
            setCurrentDate(maxDate);
        }

        if (currentDate < minDate) {
            setCurrentDate(minDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frontTracking]);

    useEffect(() => {
        const gridProps = gridEl?.current?.props;
        if (!gridProps) {
            return;
        }

        const newRect = new Rect(gridProps.x, gridProps.y, gridProps.width, gridProps.height);
        if (!rectEquals(newRect, rect)) {
            setRect(new Rect(gridProps.x, gridProps.y, gridProps.width, gridProps.height));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridEl]);

    const data = dataOnDate(frontTracking, boundaries, currentDate);
    const front = find(x => x.date.getTime() === currentDate?.getTime(), frontTracking || []);
    const flowRate = front?.flowRate ?? 0;
    const stub: DistanceSaturation = { forIsosate: false } as unknown as DistanceSaturation;

    // forIsosate = true - поток к соседу
    // forIsosate = false - поток к скважине
    // TODO
    const flowRight = false;
    // const flowRight = head(front?.byDistance ?? [stub]).forIsosate;
    return (
        <>
            <div className={css.results__wellNames}>
                <div className={cls([css.results__wellName, css.wellName])}>
                    {icon(interwellTypes[0].type)}
                    {interwellTypes[0].name} {t(dict.common.wellAbbr)}
                </div>
                <div className={cls([css.results__wellName, css.wellName])}>
                    {icon(interwellTypes[1].type)}
                    {interwellTypes[1].name} {t(dict.common.wellAbbr)}
                </div>
                <div className={css.flowDirection}>
                    <svg
                        className={cls([css.flowDirection__icon, flowRight ? css.flowDirection__icon_right : ''])}
                        xmlns='http://www.w3.org/2000/svg'
                        version='1.0'
                        viewBox='0 0 1280.000000 640.000000'
                        preserveAspectRatio='xMidYMid meet'
                    >
                        <g
                            transform='translate(0.000000,640.000000) scale(0.100000,-0.100000)'
                            fill='#000000'
                            stroke='none'
                        >
                            <path d='M3310 5925 c-36 -8 -92 -28 -125 -45 -33 -16 -352 -240 -710 -498 -357 -257 -1010 -726 -1450 -1041 -536 -384 -822 -596 -866 -640 -193 -194 -210 -498 -40 -724 48 -65 2884 -2387 2978 -2439 216 -119 480 -82 655 93 111 111 164 239 162 394 -1 133 -35 235 -113 338 -22 29 -331 289 -814 685 l-778 637 5078 5 5078 5 59 22 c241 91 391 319 372 563 -18 233 -162 415 -393 498 -45 16 -369 17 -5132 22 l-5084 5 794 570 c445 319 818 594 849 625 176 177 206 470 70 678 -74 114 -185 200 -306 237 -72 23 -207 28 -284 10z' />
                        </g>
                    </svg>
                    <div className={css.flowDirection__val}>
                        Q = {round2(flowRate)} {UnitsEnum.M3PerDay}
                    </div>
                </div>
            </div>
            <div className={commonCss.results__chart}>
                <ResponsiveContainer height='100%' width='100%'>
                    <ComposedChart
                        className={cls(['chart', 'chart_saturation'])}
                        data={data}
                        margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                    >
                        <CartesianGrid
                            strokeDasharray='1 0'
                            vertical={false}
                            stroke='#A6A6A6'
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ref={gridEl as any}
                        />
                        <XAxis dataKey='l' type='number' domain={[0, 'dataMax']} ticks={xAxisTicks(last(data)?.l)} />
                        <YAxis
                            yAxisId='left'
                            type='number'
                            orientation='left'
                            domain={[0, 1]}
                            ticks={yAxisTicks()}
                            label={{
                                value: 'FrontSaturation',
                                angle: -90,
                                position: 'insideLeft'
                            }}
                        />
                        <YAxis yAxisId='right' type='number' orientation='right' domain={[0, 1]} ticks={yAxisTicks()} />
                        {baseLine(valueProp('frontSaturation'), 'front')}
                        {baseLine(valueProp('residualOilSaturation'), 'residual')}
                        {baseLine(valueProp('initialWaterSaturation'), 'initial')}
                        {area('initialWaterSaturation', 'area_initial')}
                        {area('residualOilSaturation1', 'area_residual')}
                        {area('oil', 'area_oil')}
                        {area('water', 'area_water')}
                        {labels(rect)}
                        <Tooltip content={<SaturationTooltip />} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className={cls([commonCss.results__legend, commonCss.results__legend_saturation])}>
                <DateRangeNew
                    background={{
                        data: [],
                        type: 'oil'
                    }}
                    size='s'
                    className={'results__date-selector'}
                    isRange={false}
                    limits={dateLimits(frontTracking)}
                    current={currentDate}
                    onChange={(dt: Date) => setCurrentDate(firstDay(dt))}
                />
                <div className={cls(['legend', 'legend_columned', 'legend_saturation'])}>
                    <div className={'legend__column'}>
                        <div className={'legend__cell'}>{t(dict.proxy.frontSaturation)}:</div>
                        <div className={'legend__cell'}>
                            <div className={className('front', /*this.props.hiddenLines*/ [])} onClick={nul} />
                        </div>
                    </div>
                    <div className={'legend__column'}>
                        <div className={'legend__cell'}>{t(dict.common.oil)}:</div>
                        <div className={'legend__cell'}>
                            <div className={className('oil', /*this.props.hiddenLines*/ [])} onClick={nul} />
                        </div>
                    </div>
                    <div className={'legend__column'}>
                        <div className={'legend__cell'}>{t(dict.common.water)}:</div>
                        <div className={'legend__cell'}>
                            <div className={className('water', /*this.props.hiddenLines*/ [])} onClick={nul} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

FrontTrackingChart.displayName = 'FrontTrackingChart';

interface WithDistance {
    l: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataOnDate = (data: DateSaturation[], boundaries: FrontTrackingBoundaries, date: Date): any[] =>
    pipe(
        find((x: DateSaturation) => x.date.getTime() === date?.getTime()),
        (x: DateSaturation) => x?.byDistance ?? [],
        map(makePayload(boundaries)),
        sortBy<WithDistance>(x => x.l)
    )(data ?? []);

const makePayload = curry((boundaries: FrontTrackingBoundaries, data: DistanceSaturation): WithDistance => {
    let payload = {
        l: data.l
    };

    payload[valueProp('frontSaturation')] = data.frontSaturation;

    payload[valueProp('residualOilSaturation')] = boundaries.residualOilSaturation;
    payload[valueProp('initialWaterSaturation')] = boundaries.initialWaterSaturation;

    payload[valueProp('residualOilSaturation1')] = [boundaries.residualOilSaturation, 1];

    payload[valueProp('oil')] = [data.frontSaturation, boundaries.residualOilSaturation];
    payload[valueProp('water')] = [boundaries.initialWaterSaturation, data.frontSaturation];

    return payload;
});

const className = (propName: string, hiddenLines: string[]) => {
    return cls([
        'legend__thumb',
        `legend__thumb_${propName}`,
        any(x => valueProp(propName) === x, hiddenLines) ? 'legend__thumb_inactive' : null
    ]);
};

const dateLimits = (data: DateSaturation[]): Range<Date> =>
    new Range<Date>(head(data || [])?.date || new Date(), addDay(last(data || [])?.date || new Date()));

const yAxisTicks = () =>
    pipe(
        () => range(1, 11),
        map(x => x / 10)
    )();

const xAxisTicks = (max?: number) =>
    ifElse(
        Number.isFinite,
        pipe(
            () => range(1, 11),
            map(x => Math.round((max / 10) * x))
        ),
        always([])
    )(max);

export const area = (propName: string, clsName: string): JSX.Element => (
    <Area
        yAxisId={'left'}
        className={cls('area', clsName)}
        dataKey={valueProp(propName)}
        stroke='none'
        fill='none'
        isAnimationActive={false}
    />
);

export const labels = (rect: Rect): React.ReactNode => {
    if (!rect?.width || !rect?.height) {
        return null;
    }

    const offset = 30;
    const centerX = (rect.x ?? 0) + rect.width / 2;
    const topY = (rect.y ?? 0) + offset;
    const bottomY = (rect.y ?? 0) + rect.height - offset;
    return (
        <g className='chart__lbl'>
            <text x={centerX} y={topY} className={cls(['chart__lbl-txt', 'chart__lbl-txt_residual'])}>
                {i18n.t(dict.proxy.saturationType.oil)}
            </text>
            <text x={centerX} y={bottomY} className={cls(['chart__lbl-txt', 'chart__lbl-txt_initial'])}>
                {i18n.t(dict.proxy.saturationType.water)}
            </text>
        </g>
    );
};

export const rectEquals = (a: Rect, b: Rect): boolean =>
    (!a && !b) || (a?.x === b?.x && a?.y === b?.y && a?.width === b?.width && a?.height === b?.height);

const icon = (type: WellTypeEnum) => <div className={cls(css.wellName__icon, iconCls(type))} />;

const iconCls = (type: WellTypeEnum) =>
    cond([
        [equals(WellTypeEnum.Oil), always(css.wellName__icon_oil)],
        [equals(WellTypeEnum.Injection), always(css.wellName__icon_inj)],
        [equals(WellTypeEnum.Mixed), always(css.wellName__icon_mix)],
        [equals(WellTypeEnum.Piezometric), always(css.wellName__icon_piezo)],
        [T, always(null)]
    ])(type);
