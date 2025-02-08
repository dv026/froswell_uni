import React from 'react';

import { VStack } from '@chakra-ui/react';
import i18n from 'i18next';
import {
    any,
    append,
    equals,
    filter,
    head,
    KeyValuePair,
    isNil,
    keys,
    map,
    pipe,
    prepend,
    reject,
    includes
} from 'ramda';
import { Line, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import colors from '../../../../../../../theme/colors';
import { Chart as BaseChart } from '../../../../../../common/components/chart';
import { lineInjectionWithRepairs, lineOilWithRepairs } from '../../../../../../common/components/charts/lines';
import { PropertyTooltip } from '../../../../../../common/components/charts/tooltips/propertyTooltip';
import { WellTypeEnum } from '../../../../../../common/enums/wellTypeEnum';
import { ddmmyyyy, mmyyyy } from '../../../../../../common/helpers/date';
import { round2 } from '../../../../../../common/helpers/math';
import * as Prm from '../../../../../../common/helpers/parameters';
import { isNullOrEmpty } from '../../../../../../common/helpers/ramda';
import { cls } from '../../../../../../common/helpers/styles';
import { ChartData, isRequiredKey } from '../../../entities/chartData';
import { showRepairsState } from '../../../store/showRepairs';
import { chartData, chartPalette, siteDetailsState } from '../../../store/siteDetails';
import { wellTypeState } from '../../../store/wellType';
import { Legend } from './legend';

import dict from '../../../../../../common/helpers/i18n/dictionary/main.json';

export const Chart: React.FC = () => {
    const data = useRecoilValue(chartData);
    const palette = useRecoilValue(chartPalette);
    const showRepairs = useRecoilValue(showRepairsState);
    const siteDetails = useRecoilValue(siteDetailsState);
    const wellType = useRecoilValue(wellTypeState);

    const bestMainO = siteDetails.bestMainO ?? 0;

    const [hiddenLines, setHiddenLines] = React.useState<string[]>([]);

    const legendClick = (key: string): void => {
        const newLines = any(equals(key), hiddenLines) ? reject(equals(key), hiddenLines) : append(key, hiddenLines);

        setHiddenLines(newLines);
    };

    const isOil = wellType === WellTypeEnum.Oil;

    if (isNullOrEmpty(data)) {
        return null;
    }

    return (
        <>
            <VStack flexBasis='100%' alignItems='flex-start'>
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
                            value: isOil ? 'Дебит нефти, т/сут' : 'Закачка воды, м³/сут',
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />

                    {makeNonOptimizedLine(hiddenLines, isOil)}

                    {makeOptimizedLines(data, palette, bestMainO, hiddenLines, isOil)}

                    {showRepairs && !includes('oilRateINSIM', hiddenLines)
                        ? lineOilWithRepairs('left', 'oilRateINSIM', Prm.oilrate(), true)
                        : null}

                    {showRepairs && !includes('injectionINSIM', hiddenLines)
                        ? lineInjectionWithRepairs('left', 'injectionINSIM', Prm.injectionRate(), true)
                        : null}

                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        labelFormatter={tooltipLabelFormatter}
                        formatter={tooltipFormatter}
                    />
                </BaseChart>
                <Legend
                    className='prediction__chart-legend legend_columned'
                    onClick={legendClick}
                    hiddenLines={hiddenLines}
                    optimizations={getOptimizationLabels(palette, isOil)}
                    bestMainO={bestMainO}
                    isOil={isOil}
                />
            </VStack>
        </>
    );
};

const getOptimizationLabels = (palette: KeyValuePair<string, string>[], isOil: boolean): [string, number, string][] =>
    pipe(
        map<KeyValuePair<string, string>, [string, number, string]>(x => [x[0], +x[0].split('_')[1], x[1]]),
        prepend<[string, number, string]>([
            'nonOptimized',
            0,
            isOil ? colors.paramColors.oil : colors.paramColors.injection
        ])
    )(palette ?? []);

const getColor = (key: string, palette: KeyValuePair<string, string>[]): string =>
    (head(filter(x => x[0] === key, palette)) ?? [null, null])[1];

const makeOptimizedLines = (
    data: ChartData[],
    palette: KeyValuePair<string, string>[],
    bestO: number,
    hiddenLines: string[],
    isOil: boolean
): React.ReactElement[] => {
    if (isNullOrEmpty(data)) {
        return [];
    }

    return pipe(
        keys,
        map(key =>
            mapPropToLine(
                key,
                +key.split('_')[1] === bestO,
                isOil,
                getColor(key, palette),
                any(equals(key), hiddenLines)
            )
        ),
        reject<React.ReactElement>(isNil)
    )(data[0]);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseLineProps = (dataKey: string, className: string, color: string, dashed: boolean, hide?: boolean): any => ({
    className: cls('line', className),
    dataKey: dataKey,
    dot: false,
    isAnimationActive: false,
    stroke: color,
    strokeWidth: 3,
    strokeDasharray: dashed ? '8 5' : undefined,
    type: 'monotone',
    yAxisId: 'left',
    hide: !!hide
});

const makeNonOptimizedLine = (hiddenLines: string[], isOil: boolean): React.ReactElement => (
    <Line
        {...baseLineProps(
            'nonOptimized',
            cls('line_main'),
            isOil ? colors.paramColors.oil : colors.paramColors.injection,
            true,
            any(equals('nonOptimized'), hiddenLines)
        )}
        name='Без оптимизации'
    ></Line>
);

const mapPropToLine = (
    key: string,
    best: boolean,
    isOil: boolean,
    stroke?: string,
    hide?: boolean
): React.ReactElement => {
    if (isRequiredKey(key)) {
        return null;
    }

    const props = baseLineProps(
        key,
        cls('line_optimized', best && cls('line_main', 'line_optimized-best')),
        isOil ? colors.paramColors.oil : colors.paramColors.injection,
        false,
        hide
    );

    if (stroke) {
        props.stroke = stroke;
    }

    return <Line key={key} {...props} name={`${i18n.t(dict.common.scenario)} ${key.split('_')[1]}`}></Line>;
};

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
const tooltipFormatter = payload => round2(payload);
