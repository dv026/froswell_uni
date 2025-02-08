import React, { FC, useEffect, useState } from 'react';

import {
    Box,
    Checkbox,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack
} from '@chakra-ui/react';
import { AdaptationDynamics } from 'calculation/entities/computation/calculationDetails';
import { ArrowLeftIcon, ArrowRightIcon } from 'common/components/customIcon/general';
import { shadeColor } from 'common/helpers/colors';
import { ByTypeTooltip } from 'proxy/subModules/calculation/components/errorsChart/byTypeTooltip';
import { getTickLabel } from 'proxy/subModules/calculation/components/utils';
import { filter, map, range } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import colors from '../../../../../../theme/colors';
import { pc, px } from '../../../../../common/helpers/styles';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    dynamics: AdaptationDynamics[];

    minA: number;
    maxA: number;
}

const SIDE_PADDING = 30;

export const ErrorsChart: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    // диапазон итераций для отображения
    const [domainX, setDomainX] = useState<[number, number]>([p.minA, p.maxA]);

    // диапазон итераций на каждый момент времени при его изменении. Имеет не-null значение только в момент сдвига
    // слайдера диапазона
    const [onChangeDomain, setOnChangeDomain] = useState<[number, number]>(null);

    // данные для отображения на графике
    const [data, setData] = useState<AdaptationDynamics[]>(limitByA(p.dynamics ?? [], domainX[0], domainX[1]));

    const [bestOnly, setBestOnly] = useState(false);

    useEffect(() => {
        setData(withBest(limitByA(p.dynamics ?? [], domainX[0], domainX[1]), bestOnly));
    }, [domainX, p.dynamics, bestOnly]);

    return (
        <>
            <ResponsiveContainer height={370} width={pc(100)}>
                <AreaChart data={data} margin={{ right: SIDE_PADDING }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='a'
                        domain={domainX}
                        type='number'
                        ticks={bestOnly ? map(x => x.a, data) : range(domainX[0], domainX[1] + 1)}
                        tickFormatter={iteration => getTickLabel(iteration, data)}
                    />
                    <YAxis width={SIDE_PADDING} />
                    <Tooltip content={<ByTypeTooltip />} />

                    <Area
                        type='monotone'
                        dataKey='watercutMAE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.watercut}
                        fill={shadeColor(colors.paramColors.watercut, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='researchSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.colors.green}
                        fill={shadeColor(colors.colors.green, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='bottomHolePressureSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.bottomHolePressure}
                        fill={shadeColor(colors.paramColors.bottomHolePressure, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='injectionSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.injection}
                        fill={shadeColor(colors.paramColors.injection, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='pressureSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.pressure}
                        fill={shadeColor(colors.paramColors.pressure, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='liquidSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.liquid}
                        fill={shadeColor(colors.paramColors.liquid, 30)}
                    />

                    <Area
                        type='monotone'
                        dataKey='oilSMAPE'
                        stackId='1'
                        isAnimationActive={false}
                        stroke={colors.paramColors.oil}
                        fill={shadeColor(colors.paramColors.oil, 30)}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <Box h='40px' w='100%' p={`0 ${px(SIDE_PADDING)}`}>
                <RangeSlider
                    max={p.maxA}
                    min={p.minA}
                    defaultValue={domainX}
                    step={1}
                    height='100%'
                    onChangeStart={domain => {
                        setOnChangeDomain(domain as [number, number]);
                    }}
                    onChange={domain => {
                        setOnChangeDomain(domain as [number, number]);
                    }}
                    onChangeEnd={domain => {
                        setDomainX(domain as [number, number]);
                        setOnChangeDomain(null);
                    }}
                >
                    <RangeSliderTrack>
                        <RangeSliderFilledTrack bg='rgba(29, 60, 172, 0.1)' borderLeft='2px' borderRight='2px' />
                    </RangeSliderTrack>
                    <RangeSliderThumb boxSize={4} index={0}>
                        <ArrowRightIcon boxSize={6} zIndex={2} />
                        {!!onChangeDomain && <Label value={onChangeDomain[0]} />}
                    </RangeSliderThumb>
                    <RangeSliderThumb boxSize={4} index={1}>
                        {!!onChangeDomain && <Label value={onChangeDomain[1]} />}
                        <ArrowLeftIcon boxSize={6} zIndex={2} />
                    </RangeSliderThumb>
                </RangeSlider>
                <Checkbox isChecked={bestOnly} onChange={e => setBestOnly(e.target.checked)}>
                    {t(dict.proxy.errorsByType.bestOnly)}
                </Checkbox>
            </Box>
        </>
    );
};

const Label: FC<{ value: number }> = ({ value }) => (
    <Box
        pos='absolute'
        bg='#000000'
        color='#f8f9fc'
        display='flex'
        alignItems='center'
        justifyContent='center'
        p='0 6px'
        fontSize='12px'
        minWidth='30px'
        borderRadius='4px'
        transform='translateY(calc(-100% - 5px))'
    >
        {value}
    </Box>
);

const limitByA = (raw: AdaptationDynamics[], minA: number, maxA: number): AdaptationDynamics[] =>
    filter(x => x.a >= minA && x.a <= maxA, raw);

const withBest = (raw: AdaptationDynamics[], bestOnly: boolean): AdaptationDynamics[] =>
    bestOnly ? filter(x => x.isBest, raw) : raw;
