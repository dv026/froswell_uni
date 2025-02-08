import React, { FC, useEffect, useState } from 'react';

import { Box, Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spacer } from '@chakra-ui/react';
import i18n from 'i18next';

import { OptimizationTypeRatios } from '../../../calculation/entities/optimizationTypeRatios';
import { round0 } from '../../../common/helpers/math';
import { TypeInfo } from './typeInfo';

import dict from './../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    value: OptimizationTypeRatios;

    disabled?: boolean;

    onChange?: (ratios: OptimizationTypeRatios) => void;
}

export const OptimizationTypeSlider: FC<Props> = (p: Props) => {
    const [percents, setPercents] = useState<number>(ratiosToPercents(p.value));

    useEffect(() => {
        setPercents(ratiosToPercents(p.value));
    }, [p.value]);

    const updateInfos = (newPercent: number) => setPercents(newPercent);

    const commitChanges = (newPercent: number) => p.onChange && p.onChange(percentsToRatios(newPercent));

    const ratios = percentsToRatios(percents);

    return (
        <Box p='10px'>
            <Slider
                min={0}
                max={100}
                step={1}
                variant='brand'
                aria-label='bhp'
                value={percents}
                isDisabled={p.disabled}
                onChange={updateInfos}
                onChangeEnd={commitChanges}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
            <Flex w='100%' fontSize='12px' pt='5px' opacity={p.disabled ? 0.4 : 1}>
                <TypeInfo title={i18n.t(dict.proxy.optimization.typeBottomHolePressure)} percent={ratios.bhp} />
                <Delimiter />
                <TypeInfo title={i18n.t(dict.proxy.optimization.typeGtm)} percent={ratios.gtm} />
            </Flex>
        </Box>
    );
};

const Delimiter = () => <Spacer flexBasis='16px' />;

const ratiosToPercents = (ratios: OptimizationTypeRatios): number => round0(ratios.bhp);

const percentsToRatios = (percent: number): OptimizationTypeRatios => ({
    bhp: percent,
    gtm: 100 - percent
});
