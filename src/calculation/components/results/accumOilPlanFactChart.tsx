import React from 'react';
import { FC, useState } from 'react';

import { Box, Flex, Stack } from '@chakra-ui/react';
import { ProxyAccumOilPlanFact } from 'calculation/entities/proxyAccumOilPlanFact';
import { DotWithText } from 'common/components/charts/dots/dotWithText';
import { PropertyTooltip } from 'common/components/charts/tooltips/propertyTooltip';
import { WellPlanFactTooltip } from 'common/components/charts/tooltips/wellPlanFactTooltip';
import i18n from 'i18next';
import { any, find, includes, map, toLower } from 'ramda';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, Line, CartesianGrid, Scatter, ReferenceLine } from 'recharts';

import colors from '../../../../theme/colors';
import { AxesY, Chart } from '../../../common/components/chart';
import { getAxisLabel } from '../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../common/components/charts/legends/horizontalLegend';
import { TripleParameter } from '../../../common/components/charts/legends/parameter';
import { ChartParamEnum } from '../../../common/enums/chartParamEnum';
import { max, round0, round2 } from '../../../common/helpers/math';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { ProxyRelativePermeability } from '../../entities/proxyRelativePermeability';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

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
        name: 'kro',
        color: colors.colors.brown,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.OilPermeability),
        type: ChartParamEnum.Oil,
        yAxisId: 'left'
    },
    {
        id: 2,
        name: 'krw',
        color: colors.colors.darkblue,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.WaterPermeability),
        type: ChartParamEnum.InjectionRate,
        yAxisId: 'left'
    },
    {
        id: 3,
        name: 'fbl',
        color: colors.colors.green,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.FBL),
        yAxisId: 'left',
        type: ChartParamEnum.BuckleyLeverettFunction
    }
];

interface Props {
    data: ProxyAccumOilPlanFact[];
}

export const AccumOilPlanFactChart: React.FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const tooltipLabelFormatter = payload => payload;
    const tooltipFormatter = value => `${round2(value)}`;

    const multOffset = 1.1;

    const maxX = round0(max(map(it => it.sumOilProductionTonnesMonth, p.data)) * multOffset);
    const maxY = round0(max(map(it => it.sumOilRateINSIM, p.data)) * multOffset);

    const data = [...p.data];
    data.push({ sumOilProductionTonnesMonth: 0, y: 0 } as any);
    data.push({
        sumOilProductionTonnesMonth: maxX,
        y: maxY
    } as any);

    return (
        <Box className='prediction__chart' width='100%' height='100%'>
            <Chart
                data={data}
                className='chart chart_property-plan-fact chart_plast-distribution'
                composed={true}
                margin={{ bottom: 25 }}
            >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                    dataKey='sumOilProductionTonnesMonth'
                    type='number'
                    domain={[0, maxX]}
                    tickFormatter={(v: number) => round2(v).toString()}
                    label={{
                        position: 'insideBottom',
                        offset: -20,
                        value: `${i18n.t(dict.common.params.accumulatedOilProduction)} ${toLower(
                            i18n.t(dict.common.fact)
                        )}, ${i18n.t(dict.common.units.tonsAccumulated)}`
                    }}
                />
                <YAxis
                    dataKey='sumOilRateINSIM'
                    type='number'
                    domain={[0, maxY]}
                    orientation='left'
                    tickFormatter={(v: number) => round2(v).toString()}
                    label={getAxisLabel(
                        `${i18n.t(dict.common.params.accumulatedOilProduction)} ${toLower(
                            i18n.t(dict.common.calc)
                        )}, ${i18n.t(dict.common.units.tonsAccumulated)}`,
                        'left'
                    )}
                />
                <Line
                    dataKey='y'
                    stroke='#7E7E7E'
                    strokeWidth={2}
                    strokeDasharray='10 10'
                    dot={false}
                    activeDot={false}
                    legendType='none'
                    isAnimationActive={false}
                />
                <Scatter name='Fact' dataKey='sumOilProductionTonnesMonth' />
                <Scatter
                    name='Calc'
                    dataKey='sumOilRateINSIM'
                    fill='#A40100'
                    shape={<DotWithText dataKey={'wellName'} />}
                />
                <Tooltip
                    content={
                        <WellPlanFactTooltip
                            dataKeyWell='wellName'
                            dataKeyCalc='sumOilRateINSIM'
                            dataKeyFact='sumOilProductionTonnesMonth'
                        />
                    }
                    isAnimationActive={false}
                />
            </Chart>
        </Box>
    );
};
