import React from 'react';
import { FC, useState } from 'react';

import { Box, Flex, Stack } from '@chakra-ui/react';
import i18n from 'i18next';
import { any, find, includes, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';

import colors from '../../../../theme/colors';
import { AxesY, Chart } from '../../../common/components/chart';
import { getAxisLabel } from '../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../common/components/charts/legends/horizontalLegend';
import { TripleParameter } from '../../../common/components/charts/legends/parameter';
import { ChartParamEnum } from '../../../common/enums/chartParamEnum';
import { round2 } from '../../../common/helpers/math';
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
    data: ProxyRelativePermeability[];
    names: string[];
}

export const RelativePermeabilityChart: React.FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const [displayed, setDisplayed] = useState(columns);

    const tooltipFormatter = value => `${round2(value)}`;

    const onLegendClick = (item: ChartProp) => {
        setDisplayed(
            includes(item, displayed)
                ? displayed.filter(obj => obj.id !== item.id)
                : displayed.concat(columns.filter(x => x.id === item.id))
        );
    };

    const data = calcPermeabilities(p.data, 0.01);

    return (
        <Box className='prediction__chart' width='100%' height='95%'>
            <Chart data={data} className='chart chart_property-plan-fact chart_plast-distribution' composed={true}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                    dataKey='saturation'
                    type='number'
                    tickFormatter={(v: number) => round2(v).toString()}
                    domain={[0, 1]}
                />
                <YAxis
                    domain={[0, 1]}
                    type='number'
                    orientation='left'
                    tickFormatter={(v: number) => round2(v).toString()}
                    label={getAxisLabel(i18n.t(dict.proxy.permeabilities.labels.permeabilityAndFBL), 'left')}
                />
                {kroLines(displayed)}
                {krwLines(displayed)}
                {fblLines(displayed)}
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} formatter={tooltipFormatter} />
            </Chart>
            <HorizontalLegend>
                <Stack fontSize='sm' justifyContent='center' spacing={1} mt={'15px'}>
                    <Box>{t(dict.proxy.permeabilities.labels.kern)}:</Box>
                    <Box>{i18n.t(dict.common.fact)}:</Box>
                    <Box>{i18n.t(dict.proxy.permeabilities.labels.calculation)}:</Box>
                </Stack>
                {map(
                    (it: ChartProp) => (
                        <TripleParameter
                            key={it.name}
                            title={it.title}
                            type={it.type}
                            visible={any(x => x === it, displayed)}
                            dashed={false}
                            isDot={true}
                            onClick={() => onLegendClick(it)}
                        />
                    ),
                    columns
                )}
            </HorizontalLegend>
        </Box>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip: FC = (p: any) => {
    if (isNullOrEmpty(p.payload)) {
        return null;
    }

    const item: ProxyRelativePermeability = p.payload[0].payload;

    return (
        <Flex backgroundColor='white' border='1px solid gray'>
            <Stack p={2}>
                <Box>&nbsp;</Box>
                <Box>{i18n.t(dict.proxy.permeabilities.labels.kern)}: </Box>
                <Box>{i18n.t(dict.common.fact)}:</Box>
                <Box>{i18n.t(dict.proxy.permeabilities.labels.calculation)}:</Box>
            </Stack>
            <Stack p={2}>
                <Box fontWeight='bold'>{i18n.t(dict.proxy.permeabilities.params.OilPermeability)}</Box>
                <Box>{round2(item.oilPhasePermeabilities)}</Box>
                <Box>{round2(item.kroFact)}</Box>
                <Box>{round2(item.krwFact)}</Box>
            </Stack>
            <Stack p={2}>
                <Box fontWeight='bold'>{i18n.t(dict.proxy.permeabilities.params.WaterPermeability)}</Box>
                <Box>{round2(item.waterPhasePermeabilities)}</Box>
                <Box>{round2(item.kroCalc)}</Box>
                <Box>{round2(item.krwCalc)}</Box>
            </Stack>
            <Stack p={2}>
                <Box fontWeight='bold'>{i18n.t(dict.proxy.permeabilities.params.FBL)}</Box>
                <Box>{round2(item.kernBuckleyLeverettFunction)}</Box>
                <Box>{round2(item.buckleyLeverettFunctionFact)}</Box>
                <Box>{round2(item.buckleyLeverettFunctionCalc)}</Box>
            </Stack>
        </Flex>
    );
};

export const calcPermeabilities = (
    data: ProxyRelativePermeability[],
    stepSize: number
): ProxyRelativePermeability[] => {
    if (isNullOrEmpty(data)) {
        return null;
    }

    let points: ProxyRelativePermeability[] = [];

    let currentS = 0;

    while (currentS < data[0].saturation) {
        points.push(new ProxyRelativePermeability(currentS));
        currentS += stepSize;
    }

    for (let i = 0; i < data.length; i++) {
        points.push(data[i]);
    }

    currentS = data[data.length - 1].saturation;

    while (currentS <= 1) {
        points.push(new ProxyRelativePermeability(currentS));
        currentS += stepSize;
    }

    return points;
};

const kroLines = (displayed: ChartProp[]) => {
    if (!find(it => it.id === 1, displayed)) {
        return null;
    }

    return (
        <>
            <Line
                type='monotone'
                dataKey='oilPhasePermeabilities'
                name={i18n.t(dict.proxy.permeabilities.params.OilPermeability)}
                fill={colors.colors.brown}
                stroke={colors.colors.brown}
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='kroFact'
                name={i18n.t(dict.proxy.permeabilities.params.OilPermeability)}
                stroke={colors.colors.brown}
                strokeWidth={2}
                strokeDasharray={'10 5'}
                dot={false}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='kroCalc'
                name={i18n.t(dict.proxy.permeabilities.params.OilPermeability)}
                stroke={colors.colors.brown}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
            />
        </>
    );
};

const krwLines = (displayed: ChartProp[]) => {
    if (!find(it => it.id === 2, displayed)) {
        return null;
    }

    return (
        <>
            <Line
                type='monotone'
                dataKey='waterPhasePermeabilities'
                name={i18n.t(dict.proxy.permeabilities.params.WaterPermeability)}
                fill={colors.colors.darkblue}
                stroke={colors.colors.darkblue}
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='krwFact'
                name={i18n.t(dict.proxy.permeabilities.params.WaterPermeability)}
                stroke={colors.colors.darkblue}
                strokeWidth={2}
                strokeDasharray={'10 5'}
                dot={false}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='krwCalc'
                name={i18n.t(dict.proxy.permeabilities.params.WaterPermeability)}
                stroke={colors.colors.darkblue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
            />
        </>
    );
};

const fblLines = (displayed: ChartProp[]) => {
    if (!find(it => it.id === 3, displayed)) {
        return null;
    }

    return (
        <>
            <Line
                type='monotone'
                dataKey='kernBuckleyLeverettFunction'
                name={i18n.t(dict.proxy.permeabilities.params.FBL)}
                fill={colors.colors.green}
                stroke={colors.colors.green}
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='buckleyLeverettFunctionFact'
                name={i18n.t(dict.proxy.permeabilities.params.FBL)}
                stroke={colors.colors.green}
                strokeWidth={2}
                strokeDasharray={'10 5'}
                dot={false}
                isAnimationActive={false}
            />
            <Line
                type='monotone'
                dataKey='buckleyLeverettFunctionCalc'
                name={i18n.t(dict.proxy.permeabilities.params.FBL)}
                stroke={colors.colors.green}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
            />
        </>
    );
};
