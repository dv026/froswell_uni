import { useLayoutEffect, useMemo } from 'react';
import { useState } from 'react';

import { VStack } from '@chakra-ui/react';
import i18n from 'i18next';
import { any, equals, filter, map, mergeRight } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Line, Tooltip, XAxis, YAxis } from 'recharts';

import colors from '../../../../../../../theme/colors';
import { Chart as BaseChart } from '../../../../../../common/components/chart';
import { ChartDateRange } from '../../../../../../common/components/chartDateRange';
import * as Lines from '../../../../../../common/components/charts/lines/helpers';
import { PropertyTooltip } from '../../../../../../common/components/charts/tooltips/propertyTooltip';
import { ParamDate } from '../../../../../../common/entities/paramDate';
import { Range } from '../../../../../../common/entities/range';
import { ModeMapEnum } from '../../../../../../common/enums/modeMapEnum';
import { ParamNameEnum } from '../../../../../../common/enums/paramNameEnum';
import { UnitsEnum } from '../../../../../../common/enums/unitsEnum';
import { mmyyyy, ddmmyyyy, gteByMonth, lteByMonth } from '../../../../../../common/helpers/date';
import { round2 } from '../../../../../../common/helpers/math';
import * as Prm from '../../../../../../common/helpers/parameters';
import { isNullOrEmpty } from '../../../../../../common/helpers/ramda';
import { ChartBestMainOData } from '../../../entities/chartBestMainOData';
import { Legend } from './legend';

import dict from '../../../../../../common/helpers/i18n/dictionary/main.json';

export const correctedPressureZabLabel = Prm.pressureZab(
    ParamNameEnum.PressureZab,
    UnitsEnum.Atm,
    (_, unit) => `${i18n.t(dict.optimization.correctedPressureZab)}, ${unit}`
);

const lineProps = (withRepairs: boolean, isOil: boolean) => [
    Lines.nameField(
        Prm.liqrate(),
        Lines.leftAxis(Lines.base('liqRateINSIM', 'line__dot_liqrate line__dot_calc', colors.paramColors.liquid, false))
    ),
    Lines.nameField(
        Prm.oilrate(),
        Lines.leftAxis(
            Lines.base(
                'oilRateINSIM',
                'line__dot_oilrate line__dot_calc',
                colors.paramColors.oil,
                false,
                withRepairs && isOil
            )
        )
    ),
    Lines.nameField(
        Prm.injectionRate(),
        Lines.leftAxis(
            Lines.base(
                'injectionINSIM',
                'line__dot_injection line__dot_calc',
                colors.paramColors.injection,
                false,
                withRepairs && !isOil
            )
        )
    ),
    Lines.nameField(
        Prm.pressureZab(),
        Lines.rightAxis(
            Lines.base('pressureZab', 'line__dot_pressure line__dot_calc', colors.paramColors.pressure, true)
        )
    ),
    Lines.nameField(
        correctedPressureZabLabel,
        Lines.rightAxis(
            Lines.base('correctedPressureZab', 'line__dot_pressure line__dot_calc', colors.paramColors.pressure, false)
        )
    ),
    Lines.nameField(
        Prm.watercut(),
        Lines.rightAxis(
            Lines.base('volumeWaterCutINSIM', 'line__dot_watercut line__dot_calc', colors.paramColors.watercut, false)
        )
    ),

    Lines.nameField(
        Prm.skinFactor(),
        Lines.rightAxis(
            Lines.base('skinFactor', 'line__dot_skinFactor line__dot_calc', colors.paramColors.skinFactor, false)
        )
    )
];

const accumLineProps = (withRepairs: boolean, isOil: boolean) => [
    Lines.nameField(
        Prm.accumulatedOilProduction(),
        Lines.leftAxis(
            Lines.base(
                'sumOilRateINSIM',
                'line__dot_oilrate line__dot_calc',
                colors.paramColors.oil,
                false,
                withRepairs && isOil
            )
        )
    ),
    Lines.nameField(
        Prm.accumulatedLiqRate(),
        Lines.leftAxis(
            Lines.base('sumLiqRateINSIM', 'line__dot_liqrate line__dot_calc', colors.paramColors.liquid, false)
        )
    ),
    Lines.nameField(
        Prm.accumulatedInjectionRate(),
        Lines.leftAxis(
            Lines.base(
                'sumInjectionINSIM',
                'line__dot_injection line__dot_calc',
                colors.paramColors.injection,
                false,
                withRepairs && !isOil
            )
        )
    )
];

interface ChartBestMainOProps {
    initialChartData: ChartBestMainOData[];
    plastId: number;
    modeMapType: ModeMapEnum;
    showRepairs: boolean;
    multipleMode?: boolean;
    hiddenLines: string[];
    setHiddenLines: (value: string[]) => void;
}

export const ChartBestMainO = (props: ChartBestMainOProps) => {
    const { initialChartData, plastId, modeMapType, showRepairs, multipleMode, hiddenLines, setHiddenLines } = props;

    const { t } = useTranslation();

    const hasPlast = plastId > 0;

    const [data, setData] = useState<ChartBestMainOData[]>(initialChartData);

    useLayoutEffect(() => {
        setData(initialChartData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialChartData]);

    const initialRangeData = useMemo(
        () => map(it => ParamDate.fromRaw({ dt: it.date, value: it.oilRateINSIM }), initialChartData ?? []),
        [initialChartData]
    );

    if (!initialChartData) {
        return null;
    }

    const isHidden = (dataKey: string) => any(equals(dataKey), hiddenLines);

    const hasInj = any(x => x.injectionINSIM > 0, data || []);
    const hasOil = any(x => x.liqRateINSIM > 0, data || []);
    const accumHasInj = any(x => x.sumInjectionINSIM > 0, data || []);
    const accumHasOil = any(x => x.sumLiqRateINSIM > 0, data || []);
    const hasSkinFactor = hasPlast;
    const accumulated = modeMapType === ModeMapEnum.Accumulated;

    const correctedPressureZabLabel = Prm.pressureZab(
        ParamNameEnum.PressureZab,
        UnitsEnum.Atm,
        (_, unit) => `${t(dict.optimization.correctedPressureZab)}, ${unit}`
    );

    if (isNullOrEmpty(data)) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeLine = (props: any): JSX.Element => {
        return !!isHidden(props.dataKey.toString()) ? null : <Line key={props.dataKey.toString()} {...props} />;
    };

    const onChangeRangeHandler = (current: Range<Date>) => {
        setData(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((x: any) => gteByMonth(x.date, current.min) && lteByMonth(x.date, current.max), initialChartData)
        );
    };

    return (
        <>
            <VStack flexBasis='100%' height={'100%'} alignItems='flex-start'>
                <BaseChart
                    data={data}
                    className='chart chart_property-plan-fact chart_prediction'
                    rangeDataKey='nonOptimized'
                    rangeStroke={colors.paramColors.oil}
                    rangeXAxisDataKey='date'
                >
                    <XAxis dataKey='date' tickFormatter={x => mmyyyy(new Date(x))} />
                    <YAxis
                        yAxisId='left'
                        type='number'
                        orientation='left'
                        tickCount={8}
                        label={{
                            value: accumulated
                                ? `${Prm.accumulatedLiqRate()}; ${Prm.accumulatedOilProduction()}; ${Prm.accumulatedInjectionRate()}`
                                : `${Prm.liqrate()}; ${Prm.oilrate()}; ${Prm.injectionRate()}`,
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />
                    <YAxis
                        yAxisId='right'
                        type='number'
                        orientation='right'
                        tickCount={8}
                        domain={[0, dataMax => Math.max(100, dataMax)]}
                        label={{
                            value: accumulated
                                ? ''
                                : `${Prm.pressureZab()}; ${Prm.watercut()}; ${hasSkinFactor ? Prm.skinFactor() : ''}`,
                            angle: -90,
                            position: 'insideRight'
                        }}
                    />
                    {map(
                        x => makeLine(x),
                        accumulated ? accumLineProps(showRepairs, hasOil) : lineProps(showRepairs, hasOil)
                    )}

                    <Line
                        hide={isHidden('liqRateINSIM')}
                        name={Prm.liqrate()}
                        {...mergeRight({
                            className: 'line line_solid line_liqrate'
                        })}
                    />
                    {hasInj && (
                        <Line
                            hide={isHidden('injectionINSIM')}
                            name={Prm.injectionRate()}
                            {...mergeRight({
                                className: 'line line_solid line_injection'
                            })}
                        />
                    )}
                    <Line
                        hide={isHidden('pressureZab')}
                        name={Prm.pressureZab()}
                        {...mergeRight({
                            className: 'line line_main line_pressure'
                        })}
                    />

                    <Line
                        hide={isHidden('correctedPressureZab')}
                        name={correctedPressureZabLabel}
                        {...mergeRight({
                            className: 'line line_main line_pressure'
                        })}
                    />

                    <Line
                        name={Prm.watercut()}
                        hide={isHidden('volumeWaterCutINSIM')}
                        {...mergeRight({
                            className: 'line line_solid line_watercut'
                        })}
                    />
                    {hasOil && (
                        <Line
                            hide={isHidden('oilRateINSIM')}
                            name={Prm.oilrate()}
                            {...mergeRight({
                                className: 'line line_solid line_oilrate'
                            })}
                        />
                    )}

                    {hasSkinFactor && (
                        <Line
                            hide={isHidden('skinFactor')}
                            name={Prm.skinFactor()}
                            {...mergeRight({
                                className: 'line line_solid line_skinfactor'
                            })}
                        />
                    )}

                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        labelFormatter={tooltipLabelFormatter}
                        formatter={tooltipFormatter}
                    />
                </BaseChart>
                {!multipleMode && (
                    <>
                        <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />
                        <Legend
                            accumulated={accumulated}
                            accumHasOil={accumHasOil}
                            accumHasInj={accumHasInj}
                            hasOil={hasOil}
                            hasInj={hasInj}
                            hasSkinFactor={hasSkinFactor}
                            hiddenLines={hiddenLines}
                            setHiddenLines={setHiddenLines}
                        />
                    </>
                )}
            </VStack>
        </>
    );
};

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
const tooltipFormatter = payload => round2(payload);
