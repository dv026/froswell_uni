import React from 'react';

import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Line, Tooltip } from 'recharts';

import colors from '../../../../../theme/colors';
import { Chart, DefaultMarginOffset } from '../../../../common/components/chart';
import { PropertyTooltip } from '../../../../common/components/charts/tooltips/propertyTooltip';
import { round1 } from '../../../../common/helpers/math';
import { ProductionCalculationModel } from '../../../entities/productionCalculationModel';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    data: ProductionCalculationModel[];
    dataAvg: ProductionCalculationModel[];
    plastName?: string;
}

export const ProductionCalculationChart: React.FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    const tooltipLabelFormatter = payload => `${t(dict.calculation.params.recoveryCoeff)}: ${round1(payload)}%`;
    const tooltipFormatter = value => `${round1(value)}%`;

    return (
        <>
            <Box width='100%' height={'100%'} pos={'absolute'}>
                <Center pos={'absolute'} mt={'10px'} w={'100%'} color={colors.icons.grey}>
                    {p.plastName ?? ''}
                </Center>
                <Chart data={p.dataAvg} composed={true} disabledZoom={true} margin={{ bottom: DefaultMarginOffset }}>
                    <XAxis dataKey='recoveryCoeff' domain={[0, 100]} type='number' />
                    <YAxis domain={[0, 100]} type='number' orientation='left' tickCount={8} />
                    <Line
                        type='monotone'
                        dataKey='volumeWaterCut'
                        name={t(dict.calculation.params.volumeWaterCut)}
                        stroke={colors.icons.grey}
                        strokeWidth={2}
                        strokeDasharray={'10 5'}
                        dot={false}
                        isAnimationActive={false}
                    />
                </Chart>
            </Box>
            <Box width='100%'>
                <Chart data={p.data} composed={true} disabledZoom={true} margin={{ bottom: DefaultMarginOffset }}>
                    <XAxis
                        dataKey='recoveryCoeff'
                        domain={[0, 100]}
                        type='number'
                        label={{
                            position: 'insideBottom',
                            offset: -10,
                            value: `${t(dict.calculation.params.recoveryCoeff)}, ${t(dict.common.units.percent)}`
                        }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        type='number'
                        orientation='left'
                        tickCount={8}
                        label={{
                            value: `${t(dict.calculation.params.volumeWaterCut)}, ${t(dict.common.units.percent)}`,
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />
                    <Line
                        type='monotone'
                        dataKey='volumeWaterCut'
                        name={t(dict.calculation.params.volumeWaterCut)}
                        stroke={colors.colors.red}
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        labelFormatter={tooltipLabelFormatter}
                        formatter={tooltipFormatter}
                    />
                </Chart>
            </Box>
        </>
    );
};
