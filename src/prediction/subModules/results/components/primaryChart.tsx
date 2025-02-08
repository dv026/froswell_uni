import React, { FC, useLayoutEffect, useMemo, useState } from 'react';

import { VStack } from '@chakra-ui/layout';
import i18n from 'i18next';
import {
    eqBy,
    equals,
    ifElse,
    intersection,
    isNil,
    map,
    not,
    pipe,
    sortBy,
    length,
    join,
    filter,
    includes,
    any,
    reject,
    append,
    without,
    concat,
    all
} from 'ramda';
import { Bar, Line, Tooltip, XAxis, YAxis } from 'recharts';

import colors from '../../../../../theme/colors';
import { Chart } from '../../../../common/components/chart';
import { ChartDateRange } from '../../../../common/components/chartDateRange';
import { getAxisLabel } from '../../../../common/components/charts/axes';
import { lineInjectionWithRepairs, lineOilWithRepairs } from '../../../../common/components/charts/lines';
import * as Lines from '../../../../common/components/charts/lines/helpers';
import { PropertyPlanFact } from '../../../../common/components/charts/tooltips/propertyPlanFactTooltip';
import { ParamDate } from '../../../../common/entities/paramDate';
import { Range } from '../../../../common/entities/range';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { ParamNameEnum } from '../../../../common/enums/paramNameEnum';
import { UnitsEnum } from '../../../../common/enums/unitsEnum';
import { opacity } from '../../../../common/helpers/colors';
import { gteByMonth, lteByMonth, mmyyyy } from '../../../../common/helpers/date';
import * as Prm from '../../../../common/helpers/parameters';
import { findOrDefault, fnAsIs, isNullOrEmpty, shallow, sortAsc } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';
import { PlastDateProps, PlastPropsDynamic, WellDetailsModel } from '../../../entities/wellDetailsModel';
import { ChartItem } from '../entities/chartItem';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const linkedLines = ['pressureReal', 'pressureCalc', 'watercutReal', 'watercutCalc'];
const skinFactorLines = ['skinFactorReal', 'skinFactorCalc'];

const lineProps = [
    Lines.leftAxis(
        Lines.liqrate(
            Lines.calc(Lines.base('liqrateCalc', 'line__dot_liqrate line__dot_calc', colors.paramColors.liquid))
        )
    ),
    Lines.leftAxis(
        Lines.liqrate(Lines.base('liqrateReal', 'line__dot_liqrate line__dot_real', colors.paramColors.liquid, true))
    ),
    Lines.leftAxis(
        Lines.oilrate(Lines.calc(Lines.base('oilrateCalc', 'line__dot_oilrate line__dot_calc', colors.paramColors.oil)))
    ),
    Lines.leftAxis(
        Lines.oilrate(Lines.base('oilrateReal', 'line__dot_oilrate line__dot_real', colors.paramColors.oil, true))
    ),
    Lines.leftAxis(
        Lines.injection(
            Lines.calc(Lines.base('injectionCalc', 'line__dot_injection line__dot_calc', colors.paramColors.injection))
        )
    ),
    Lines.leftAxis(
        Lines.injection(
            Lines.base('injectionReal', 'line__dot_injection line__dot_real', colors.paramColors.injection, true)
        )
    ),
    Lines.rightAxis(
        Lines.pressure(
            Lines.calc(Lines.base('pressureCalc', 'line__dot_pressure line__dot_calc', colors.paramColors.pressure))
        )
    ),
    Lines.dot(
        Lines.rightAxis(
            Lines.pressure(
                Lines.real(
                    Lines.base('pressureReal', 'line__dot_pressure line__dot_real', colors.paramColors.pressure, true)
                )
            )
        )
    ),
    Lines.rightAxis(
        Lines.watercut(
            Lines.calc(Lines.base('watercutCalc', 'line__dot_watercut line__dot_calc', colors.paramColors.watercut))
        )
    ),
    Lines.rightAxis(
        Lines.watercut(
            Lines.base('watercutReal', 'line__dot_watercut line__dot_real', colors.paramColors.watercut, true)
        )
    ),

    Lines.rightAxis(
        Lines.bottomHolePressure(
            Lines.calc(
                Lines.base(
                    'pressureBottomHoleCalc',
                    'line__dot_pressureBottomHole line__dot_calc',
                    colors.paramColors.bottomHolePressure
                )
            )
        )
    ),
    Lines.rightAxis(
        Lines.bottomHolePressure(
            Lines.base(
                'pressureBottomHoleReal',
                'line__dot_pressureBottomHole line__dot_real',
                colors.paramColors.bottomHolePressure,
                true
            )
        )
    ),

    Lines.rightAxis(
        Lines.skinFactor(
            Lines.calc(
                Lines.base('skinFactorCalc', 'line__dot_skinfactor line__dot_calc', colors.paramColors.skinFactor)
            )
        )
    ),
    Lines.dot(
        Lines.rightAxis(
            Lines.skinFactor(
                Lines.real(
                    Lines.base(
                        'skinFactorReal',
                        'line__dot_skinfactor line__dot_real',
                        colors.paramColors.skinFactor,
                        true
                    )
                )
            )
        )
    )
];

export const getInitialChartData = (
    data: PlastPropsDynamic[],
    wellId: number,
    plastId: number,
    modeMapType: ModeMapEnum
): ChartItem[] => {
    const byWellMode = not(isNil(wellId));
    const byPlastMode = plastId > 0;

    return pipe(
        (x: PlastPropsDynamic[]) =>
            findOrDefault(
                x => x.plastId === plastId,
                x => x.properties,
                [],
                x
            ),
        sortBy((x: PlastDateProps) => x.date),
        map(x => toChartData(byWellMode, byPlastMode, x)),
        x =>
            ifElse(
                equals(ModeMapEnum.Accumulated),
                () => map(kilo, x),
                () => fnAsIs(x)
            )(modeMapType)
    )(data || []);
};

interface PrimaryChartProps {
    wellId?: number;
    modeMapType: ModeMapEnum;
    plastId: number;
    showRepairs?: boolean;
    data: ChartItem[];
    multipleMode?: boolean;
    hiddenLines: string[];
    setHiddenLines: (value: string[]) => void;
}

export const PrimaryChart = (props: PrimaryChartProps) => {
    const { modeMapType, wellId, plastId, showRepairs, data, multipleMode, hiddenLines, setHiddenLines } = props;

    const byWellMode = not(isNil(wellId));
    const byPlastMode = plastId > 0;

    const initialRangeData = useMemo(
        () => map(it => ParamDate.fromRaw({ dt: it.date, value: it.oilrateCalc }), data ?? []),
        [data]
    );

    const [chartData, setChartData] = useState<ChartItem[]>(data);

    useLayoutEffect(() => {
        setChartData(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (isNil(data)) {
        return null;
    }

    if (isNullOrEmpty(chartData)) {
        return null;
    }

    const isAccumulated = modeMapType === ModeMapEnum.Accumulated;

    const makeAxisLeftLabel = (accumulated: boolean): string => {
        return join(
            '; ',
            filter(
                x => x !== null,
                [
                    includesAll(hiddenLines, ['liqrateReal', 'liqrateCalc']) ? null : liqLabel(accumulated),
                    includesAll(hiddenLines, ['oilrateReal', 'oilrateCalc']) ? null : oilLabel(accumulated),
                    includesAll(hiddenLines, ['injectionReal', 'injectionCalc']) ? null : injLabel(accumulated)
                ]
            )
        );
    };

    const makeAxisRightLabel = () => {
        if (!includes('skinFactorCalc', hiddenLines)) {
            return i18n.t(dict.common.params.skinFactor);
        }

        return join(
            '; ',
            filter(
                x => x !== null,
                [
                    includesAll(hiddenLines, ['pressureReal', 'pressureCalc']) ? null : Prm.pressureRes(),
                    includesAll(hiddenLines, ['watercutReal', 'watercutCalc']) ? null : Prm.watercut(),
                    includesAll(hiddenLines, ['pressureBottomHoleReal', 'pressureBottomHoleCalc'])
                        ? null
                        : Prm.pressureZab()
                ]
            )
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeLine = (props: any): JSX.Element => {
        return !!isHidden(props.dataKey.toString()) ? null : <Line key={props.dataKey.toString()} {...props} />;
    };

    const isHidden = (lineId: string): boolean => {
        return any(x => x === lineId, hiddenLines);
    };

    const renderWellsCount = () => {
        if (byWellMode) {
            return null;
        }

        const axisId = 'axis-stock';
        const topLimit = pipe(
            map((x: ChartItem) => x.stock),
            sortAsc,
            x => x[x.length - 1]
        )(chartData);

        return [
            <YAxis key='wells-in-work-axis' yAxisId={axisId} ticks={[]} domain={[0, topLimit * 3]} hide={true} />,
            <Bar
                key='wells-in-work-area'
                className='area_wells-in-work'
                yAxisId={axisId}
                dataKey='stock'
                fill={opacity(colors.colors.green, 0.1)}
                stroke={colors.colors.green}
                isAnimationActive={false}
                hide={any(x => x === 'stock', hiddenLines)}
            />
        ];
    };

    const onChangeRangeHandler = (current: Range<Date>) => {
        setChartData(filter(x => gteByMonth(x.date, current.min) && lteByMonth(x.date, current.max), data));
    };

    return (
        <VStack flexBasis='100%' height='100%' alignItems='flex-start'>
            <Chart
                data={chartData}
                className='chart chart_property-plan-fact'
                composed={true}
                rangeDataKey='oilrateCalc'
                rangeStroke={colors.paramColors.oil}
                rangeXAxisDataKey='date'
            >
                <XAxis dataKey='date' tickFormatter={x => mmyyyy(new Date(x))} />
                <YAxis
                    yAxisId='left'
                    type='number'
                    orientation='left'
                    tickCount={8}
                    label={getAxisLabel(makeAxisLeftLabel(isAccumulated), 'left')}
                />
                <YAxis
                    yAxisId='right'
                    type='number'
                    orientation='right'
                    tickCount={8}
                    label={getAxisLabel(makeAxisRightLabel(), 'right')}
                />

                {renderWellsCount()}

                {map(x => makeLine(x), lineProps)}

                {showRepairs && !includes('oilrateCalc', hiddenLines)
                    ? lineOilWithRepairs('left', 'oilrateCalc', Prm.oilrate(), true)
                    : null}

                {showRepairs && !includes('injectionCalc', hiddenLines)
                    ? lineInjectionWithRepairs('left', 'injectionCalc', Prm.injectionRate(), true)
                    : null}

                <Tooltip
                    content={
                        <PropertyPlanFact
                            keysToShow={[
                                'oilrate',
                                'liqrate',
                                any(x => x.startsWith('skinFactor'), hiddenLines) ? 'pressure' : null,
                                'injection',
                                any(x => x.startsWith('skinFactor'), hiddenLines) ? 'watercut' : null,
                                all(x => !x.startsWith('skinFactor'), hiddenLines) && byWellMode && byPlastMode
                                    ? 'skinFactor'
                                    : null,
                                any(x => x.startsWith('pressureBottomHole'), hiddenLines) ? null : 'pressureBottomHole',
                                byWellMode ? null : 'stock'
                            ]}
                            accumulated={isAccumulated}
                        />
                    }
                    isAnimationActive={false}
                />
            </Chart>
            {!multipleMode && (
                <>
                    <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />
                    <Legend
                        byWell={byWellMode}
                        byPlast={byPlastMode}
                        isAccumulated={isAccumulated}
                        hiddenLines={hiddenLines}
                        setHiddenLines={setHiddenLines}
                    />
                </>
            )}
        </VStack>
    );
};

interface LegendProps {
    byPlast: boolean;
    byWell: boolean;
    hiddenLines: string[];
    isAccumulated: boolean;
    setHiddenLines: (lines: string[]) => void;
}

export const Legend: FC<LegendProps> = (p: LegendProps) => {
    const toggleLine = (lineId: string) => {
        if (any(x => x === lineId, p.hiddenLines)) {
            p.setHiddenLines(reject(equals(lineId), p.hiddenLines));
        } else {
            p.setHiddenLines(append(lineId, p.hiddenLines));
        }
    };

    const toggleRightAxis = (lineId: string) => {
        let lines = null;

        if (lineId.startsWith('skinFactor')) {
            if (any(x => x.startsWith('skinFactor'), p.hiddenLines)) {
                lines = pipe(without(skinFactorLines), concat(linkedLines))(p.hiddenLines);
            } else {
                lines = pipe(without(linkedLines), append('skinFactorReal'), append('skinFactorCalc'))(p.hiddenLines);
            }
        } else {
            if (any(x => x === lineId, p.hiddenLines)) {
                lines = pipe(reject(equals(lineId)), append('skinFactorReal'), append('skinFactorCalc'))(p.hiddenLines);
            } else {
                lines = pipe(append(lineId), append('skinFactorReal'), append('skinFactorCalc'))(p.hiddenLines);
            }
        }

        p.setHiddenLines(lines);
    };

    const makeCls = (id: string, isCalc: boolean) =>
        cls([
            'legend__thumb',
            isCalc ? 'legend__thumb_calc' : 'legend__thumb_real',
            any(x => x === id, p.hiddenLines) ? 'legend__thumb_inactive' : null
        ]);

    const stockThumbCls = cls([
        'legend__thumb',
        'legend__thumb_stock',
        any(x => x === 'stock', p.hiddenLines) ? 'legend__thumb_inactive' : null
    ]);

    const stockColumn = p.byWell ? null : (
        <div className='legend__column legend__column_stock'>
            <div className='legend__cell'>{i18n.t(dict.common.wellFund)}</div>
            <div className='legend__cell'>
                <div className={stockThumbCls} onClick={() => toggleLine('stock')} />
            </div>
            <div className='legend__cell'>&nbsp;</div>
        </div>
    );

    const bottomHolePressureColumn = (
        <div className='legend__column legend__column_pressureBottomHole'>
            <div className='legend__cell'>{Prm.pressureZab()}</div>
            <div className='legend__cell'>
                <div
                    className={makeCls('pressureBottomHoleCalc', true)}
                    onClick={() => toggleRightAxis('pressureBottomHoleCalc')}
                />
            </div>
            <div className='legend__cell'>
                <div
                    className={makeCls('pressureBottomHoleReal', false)}
                    onClick={() => toggleRightAxis('pressureBottomHoleReal')}
                />
            </div>
        </div>
    );

    const skinThumbCls = cls([
        'legend__thumb',
        'legend__thumb_skinfactor',
        any(x => x.startsWith('skinFactor'), p.hiddenLines) ? 'legend__thumb_inactive' : null
    ]);

    const skinFactorColumn = p.byWell && p.byPlast && (
        <div className='legend__column legend__column_skinfactor'>
            <div className='legend__cell'>{i18n.t(dict.common.params.skinFactor)}</div>
            <div className='legend__cell'>
                <div className={skinThumbCls} onClick={() => toggleRightAxis('skinFactorCalc')} />
            </div>
            <div className='legend__cell'>&nbsp;</div>
        </div>
    );

    return (
        <div className='prediction__chart-legend legend legend_columned legend_property-plan-fact'>
            <div className='legend__column legend__column_titles'>
                <div className='legend__cell legend__cell_title' />
                <div className='legend__cell legend__cell_title'>{i18n.t(dict.common.calc)}:</div>
                <div className='legend__cell legend__cell_title'>{i18n.t(dict.common.fact)}:</div>
            </div>
            <div className='legend__column legend__column_liqrate'>
                <div className='legend__cell'>{liqLabel(p.isAccumulated)}</div>
                <div className='legend__cell'>
                    <div className={makeCls('liqrateCalc', true)} onClick={() => toggleLine('liqrateCalc')} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls('liqrateReal', false)} onClick={() => toggleLine('liqrateReal')} />
                </div>
            </div>
            <div className='legend__column legend__column_oilrate'>
                <div className='legend__cell'>{oilLabel(p.isAccumulated)}</div>
                <div className='legend__cell'>
                    <div className={makeCls('oilrateCalc', true)} onClick={() => toggleLine('oilrateCalc')} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls('oilrateReal', false)} onClick={() => toggleLine('oilrateReal')} />
                </div>
            </div>
            <div className='legend__column legend__column_injection'>
                <div className='legend__cell'>{injLabel(p.isAccumulated)}</div>
                <div className='legend__cell'>
                    <div className={makeCls('injectionCalc', true)} onClick={() => toggleLine('injectionCalc')} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls('injectionReal', false)} onClick={() => toggleLine('injectionReal')} />
                </div>
            </div>
            <div className='legend__column legend__column_pressure'>
                <div className='legend__cell'>{Prm.pressureRes()}</div>
                <div className='legend__cell'>
                    <div className={makeCls('pressureCalc', true)} onClick={() => toggleRightAxis('pressureCalc')} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls('pressureReal', false)} onClick={() => toggleRightAxis('pressureReal')} />
                </div>
            </div>
            <div className='legend__column legend__column_watercut'>
                <div className='legend__cell'>{Prm.watercut()}</div>
                <div className='legend__cell'>
                    <div className={makeCls('watercutCalc', true)} onClick={() => toggleRightAxis('watercutCalc')} />
                </div>
                <div className='legend__cell'>
                    <div className={makeCls('watercutReal', false)} onClick={() => toggleRightAxis('watercutReal')} />
                </div>
            </div>
            {bottomHolePressureColumn}
            {skinFactorColumn}
            {stockColumn}
        </div>
    );
};

export const toChartData = (byWell: boolean, byPlast: boolean, props: PlastDateProps): ChartItem => {
    let item = new ChartItem();

    item.date = props.date;
    item.injectionCalc = props.calc.injection;
    item.liqrateCalc = props.calc.liqRate;
    item.oilrateCalc = props.calc.oilRate;
    item.pressureCalc = props.calc.pressure;
    item.watercutCalc = props.calc.watercut;
    item.skinFactorCalc = props.calc.skinFactor;
    item.pressureBottomHoleCalc = props.calc.bottomHolePressure;

    item.injectionReal = props.real?.injection ?? null;
    item.oilrateReal = props.real?.oilRate ?? null;
    item.liqrateReal = props.real?.liqRate ?? null;
    item.pressureReal = props.real?.pressure ?? null;
    item.watercutReal = props.real?.watercut ?? null;
    item.skinFactorReal = props.real?.skinFactor ?? null;
    item.pressureBottomHoleReal = props.real?.bottomHolePressure ?? null;

    item.stock = props.stock;
    item.repairName = props.repairName;
    item.repairNameInjection = props.repairNameInjection;

    return item;
};

export const inKilo = (val: number) => val / 1000;
export const kilo = (item: ChartItem): ChartItem =>
    shallow(item, {
        liqrateCalc: inKilo(item.liqrateCalc),
        liqrateReal: inKilo(item.liqrateReal),

        oilrateCalc: inKilo(item.oilrateCalc),
        oilrateReal: inKilo(item.oilrateReal),

        injectionCalc: inKilo(item.injectionCalc),
        injectionReal: inKilo(item.injectionReal)
    });

export const includesAll = (all, searching) => pipe(intersection(all), eqBy(length, searching))(searching);

export const liqLabel = (accumulated: boolean) =>
    Prm.liqrate(
        accumulated ? ParamNameEnum.LiqProduction : ParamNameEnum.LiqRate,
        accumulated ? UnitsEnum.M3Accumulated : undefined
    );

export const oilLabel = (accumulated: boolean) =>
    Prm.oilrate(
        accumulated ? ParamNameEnum.OilProduction : ParamNameEnum.OilRate,
        accumulated ? UnitsEnum.TonsAccumulated : undefined
    );

export const injLabel = (accumulated: boolean) =>
    Prm.injectionRate(ParamNameEnum.InjectionRate, accumulated ? UnitsEnum.M3Accumulated : undefined);
