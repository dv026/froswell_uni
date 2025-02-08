import React, { FC } from 'react';

import { VStack } from '@chakra-ui/react';
import { ProxyLiquidBalance } from 'calculation/entities/proxyLiquidBalance';
import { AxesY, Chart as BaseChart } from 'common/components/chart';
import { HorizontalLegend } from 'common/components/charts/legends/horizontalLegend';
import { Parameter } from 'common/components/charts/legends/parameter';
import { PropertyTooltip } from 'common/components/charts/tooltips/propertyTooltip';
import { ChartParamEnum } from 'common/enums/chartParamEnum';
import { ddmmyyyy, mmyyyy } from 'common/helpers/date';
import { round2 } from 'common/helpers/math';
import * as Prm from 'common/helpers/parameters';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { any, equals, includes, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Line, Tooltip, XAxis, YAxis } from 'recharts';

import colors from '../../../../theme/colors';

interface ChartProp {
    color: string;
    id: number;
    isKnown: boolean;
    name: string;
    title: string;
    type: ChartParamEnum;
    yAxisId: AxesY;
}

const columns: ChartProp[] = [
    {
        id: 1,
        name: 'sumLiquidProduction',
        color: colors.paramColors.liquid,
        isKnown: false,
        title: Prm.accumulatedLiqRate(),
        yAxisId: 'left',
        type: ChartParamEnum.Liquid
    },
    {
        id: 2,
        name: 'sumInjection',
        color: colors.paramColors.injection,
        isKnown: false,
        title: Prm.accumulatedInjectionRate(),
        yAxisId: 'left',
        type: ChartParamEnum.InjectionRate
    },
    {
        id: 3,
        name: 'sumAquiferInflux',
        color: colors.paramColors.gas,
        isKnown: false,
        title: Prm.aquifer(),
        yAxisId: 'left',
        type: ChartParamEnum.Gas
    },
    {
        id: 4,
        name: 'sumOutFlux',
        color: colors.paramColors.inspection,
        isKnown: false,
        title: Prm.accumulatedOutFlux(),
        yAxisId: 'left',
        type: ChartParamEnum.Stock
    },
    {
        id: 5,
        name: 'pressureINSIM',
        color: colors.paramColors.pressure,
        isKnown: false,
        title: Prm.pressureRes(),
        yAxisId: 'right',
        type: ChartParamEnum.Pressure
    }
];

export interface PrimaryChartProps {
    chartData: ProxyLiquidBalance[];
}

export const LiquidBalanceChart: FC<PrimaryChartProps> = (props: PrimaryChartProps) => {
    const { chartData } = props;

    const { t } = useTranslation();

    const [hiddenLines, setHiddenLines] = React.useState<string[]>([]);

    const isHidden = (dataKey: string) => any(equals(dataKey), hiddenLines);

    if (isNullOrEmpty(chartData)) {
        return null;
    }

    const onLegendClick = (dataKey: string) =>
        setHiddenLines(
            includes(dataKey, hiddenLines) ? hiddenLines.filter(obj => obj !== dataKey) : hiddenLines.concat(dataKey)
        );

    return (
        <VStack flexBasis='100%' alignItems='flex-start'>
            <BaseChart
                data={chartData}
                className='chart chart_property-plan-fact chart_efficiency'
                rangeDataKey='nonOptimized'
                rangeStroke={colors.paramColors.oil}
                rangeXAxisDataKey='dt'
                composed={true}
                disabledZoom={true}
                margin={{ bottom: 0 }}
            >
                <XAxis dataKey='dt' tickFormatter={x => mmyyyy(new Date(x))} />
                <YAxis
                    yAxisId='left'
                    type='number'
                    orientation='left'
                    tickCount={8}
                    label={{
                        value: map(
                            it => it.title,
                            columns.filter(x => x.yAxisId === 'left')
                        ).join('; '),
                        angle: -90,
                        position: 'insideLeft'
                    }}
                />
                <YAxis
                    yAxisId='right'
                    type='number'
                    orientation='right'
                    tickCount={8}
                    domain={[0, 100]}
                    label={{
                        value: map(
                            it => it.title,
                            columns.filter(x => x.yAxisId === 'right')
                        ).join('; '),
                        angle: -90,
                        position: 'insideRight'
                    }}
                />
                {map(
                    (it: ChartProp) => (
                        <Line
                            key={it.name}
                            className={'line line_solid'}
                            dataKey={it.name}
                            hide={isHidden(it.name)}
                            isAnimationActive={false}
                            name={it.title}
                            strokeWidth={2}
                            stroke={it.color}
                            type={'monotone'}
                            yAxisId={it.yAxisId}
                            dot={null}
                        />
                    ),
                    columns
                )}
                <Tooltip
                    content={<PropertyTooltip />}
                    isAnimationActive={false}
                    labelFormatter={tooltipLabelFormatter}
                    formatter={tooltipFormatter}
                    label={null}
                />
            </BaseChart>
            <HorizontalLegend>
                {map(
                    (it: ChartProp) => (
                        <Parameter
                            key={it.name}
                            title={it.title}
                            type={it.type}
                            visible={!any(x => x === it.name, hiddenLines)}
                            dashed={false}
                            isDot={true}
                            onClick={() => onLegendClick(it.name)}
                        />
                    ),
                    columns
                )}
            </HorizontalLegend>
        </VStack>
    );
};

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
const tooltipFormatter = payload => (Array.isArray(payload) ? null : round2(payload));
