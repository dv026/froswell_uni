import React, { FC } from 'react';

import { VStack } from '@chakra-ui/react';
import { AxesY, Chart as BaseChart, DefaultMarginOffset } from 'common/components/chart';
import { RepairIcon } from 'common/components/charts/dots/repairIcon';
import { HorizontalLegend } from 'common/components/charts/legends/horizontalLegend';
import { Parameter } from 'common/components/charts/legends/parameter';
import * as Lines from 'common/components/charts/lines/helpers';
import { PropertyTooltip } from 'common/components/charts/tooltips/propertyTooltip';
import { ChartParamEnum } from 'common/enums/chartParamEnum';
import { ddmmyyyy, mmyyyy } from 'common/helpers/date';
import { round2 } from 'common/helpers/math';
import * as Prm from 'common/helpers/parameters';
import { isNullOrEmpty, nul } from 'common/helpers/ramda';
import { ChartData } from 'commonEfficiency/entities/chartData';
import i18n from 'i18next';
import { any, equals, includes, isNil, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Line, Tooltip, XAxis, YAxis, Area } from 'recharts';

import colors from '../../../theme/colors';

import dict from 'common/helpers/i18n/dictionary/main.json';

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
        name: 'factOil',
        color: colors.paramColors.oil,
        isKnown: false,
        title: Prm.oilrate(),
        yAxisId: 'left',
        type: ChartParamEnum.Oil
    },
    {
        id: 2,
        name: 'liquidVolumeRate',
        color: colors.paramColors.liquid,
        isKnown: false,
        title: Prm.liqrate(),
        yAxisId: 'left',
        type: ChartParamEnum.Liquid
    },
    {
        id: 3,
        name: 'watercutVolume',
        color: colors.paramColors.watercut,
        isKnown: false,
        title: Prm.watercut(),
        yAxisId: 'left',
        type: ChartParamEnum.Watercut
    }
];

export interface PrimaryChartProps {
    accumGrowth: number;
    chartData: ChartData[];
    repairMode: number;
}

export const PrimaryChart: FC<PrimaryChartProps> = (props: PrimaryChartProps) => {
    const { accumGrowth, chartData, repairMode } = props;

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
                        value: `${Prm.oilrate()}; ${Prm.liqrate()}`,
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
                        value: `${Prm.watercut()};`,
                        angle: -90,
                        position: 'insideRight'
                    }}
                />

                {repairMode === 0
                    ? [
                          <Line
                              key='factOil'
                              className={'line line_solid line_oilrate'}
                              dataKey={'factOil'}
                              dot={<CustomizedDot />}
                              hide={isHidden('factOil')}
                              isAnimationActive={false}
                              name={Prm.oilrate()}
                              strokeWidth={2}
                              stroke={colors.paramColors.oil}
                              type={'monotone'}
                              yAxisId={'left'}
                          />,
                          <Line
                              key='liquidVolumeRate'
                              className={'line line_solid line_liqrate'}
                              dataKey={'liquidVolumeRate'}
                              hide={isHidden('liquidVolumeRate')}
                              isAnimationActive={false}
                              name={Prm.liqrate()}
                              strokeWidth={2}
                              stroke={colors.paramColors.liquid}
                              type={'monotone'}
                              yAxisId={'left'}
                              dot={null}
                          />,
                          <Line
                              key='watercutVolume'
                              className={'line line_solid line_watercut'}
                              dataKey={'watercutVolume'}
                              hide={isHidden('watercutVolume')}
                              isAnimationActive={false}
                              name={Prm.watercut()}
                              strokeWidth={2}
                              stroke={colors.paramColors.watercut}
                              type={'monotone'}
                              yAxisId={'right'}
                              dot={null}
                          />
                      ]
                    : null}

                {repairMode > 0
                    ? [
                          accumGrowth > 0 ? (
                              <Area
                                  key='areaOil'
                                  yAxisId='left'
                                  className='area'
                                  name={Prm.oilrate()}
                                  dataKey='areaOil'
                                  fill={colors.paramColors.oil}
                                  opacity={0.2}
                                  stroke={'none'}
                                  isAnimationActive={false}
                                  type='monotone'
                                  label={false}
                                  tooltipType='none'
                              />
                          ) : null,
                          <Line
                              key={'baseOil'}
                              name={`${t(dict.common.params.oilRate)} ${t(dict.common.dataType.calc)} ${t(
                                  dict.common.units.tonsPerDay
                              )}`}
                              {...(Lines.leftAxis(
                                  Lines.oilrate(
                                      Lines.base(
                                          'baseOil',
                                          'line__dot_oilrate line__dot_calc',
                                          colors.paramColors.oil,
                                          true
                                      )
                                  )
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              ) as unknown as any)}
                          />,
                          <Line
                              key={'factOil'}
                              className={'line line_solid line_oilrate'}
                              dataKey={'factOil'}
                              dot={<CustomizedDot />}
                              hide={isHidden('factOil')}
                              isAnimationActive={false}
                              name={`${t(dict.common.params.oilRate)} ${t(dict.common.dataType.fact)} ${t(
                                  dict.common.units.tonsPerDay
                              )}`}
                              stroke={colors.paramColors.oil}
                              strokeWidth={2}
                              type={'monotone'}
                              yAxisId={'left'}
                          />
                      ]
                    : null}

                <Tooltip
                    content={<PropertyTooltip />}
                    isAnimationActive={false}
                    labelFormatter={tooltipLabelFormatter}
                    formatter={tooltipFormatter}
                    label={null}
                />
            </BaseChart>
            <HorizontalLegend>
                {repairMode === 0 ? (
                    map(
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
                    )
                ) : (
                    <Parameter
                        key={'factOil'}
                        title={Prm.oilrate()}
                        type={ChartParamEnum.Oil}
                        visible={true}
                        dashed={false}
                        isDot={true}
                        onClick={nul}
                    />
                )}
            </HorizontalLegend>
        </VStack>
    );
};

const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
const tooltipFormatter = payload => (Array.isArray(payload) ? null : round2(payload));

// TODO: типизация
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class CustomizedDot extends React.Component<any> {
    public render() {
        if (!isNil(this.props.payload.operationId)) {
            const { cx, cy, payload } = this.props;

            return <RepairIcon cx={cx} cy={cy} text={payload.operationName} />;
        }

        return null;
    }
}
