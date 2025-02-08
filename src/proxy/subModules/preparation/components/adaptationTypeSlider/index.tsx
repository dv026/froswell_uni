import React, { FC, useEffect, useState } from 'react';

import {
    Box,
    Flex,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Spacer
} from '@chakra-ui/react';
import i18n from 'i18next';

import colors from '../../../../../../theme/colors';
import { AdaptationTypeRatios } from '../../../../../calculation/entities/adaptationTypeRatios';
import { round0 } from '../../../../../common/helpers/math';
import { TypeInfo } from './typeInfo';

import dict from './../../../../../common/helpers/i18n/dictionary/main.json';

type Percents = [GeoModel: number, PermeabilitiesAndGeoModel: number];

const COLOR_PERM = colors.typo.darkGreen;
const COLOR_SKIN = colors.typo.placeholder;
const COLOR_GEO = colors.colors.darkblue;

interface Props {
    value: AdaptationTypeRatios;

    disabled?: boolean;

    onChange?: (ratios: AdaptationTypeRatios) => void;
}

export const AdaptationTypeSlider: FC<Props> = (p: Props) => {
    const [percents, setPercents] = useState<Percents>(ratiosToPercents(p.value));

    useEffect(() => {
        setPercents(ratiosToPercents(p.value));
    }, [p.value]);

    const updateInfos = (newPercents: Percents) => setPercents(newPercents);

    const commitChanges = (newPercents: Percents) => p.onChange && p.onChange(percentsToRatios(newPercents));

    const ratios = percentsToRatios(percents);

    return (
        <Box p='10px'>
            <RangeSlider
                min={0}
                max={100}
                step={1}
                variant='brand'
                aria-label={['geomodel', 'permeabilities']}
                value={percents}
                isDisabled={p.disabled}
                onChange={updateInfos}
                onChangeEnd={commitChanges}
            >
                <RangeSliderTrack bg={getTrackBg(percents[0], percents[1] - percents[0])}>
                    <RangeSliderFilledTrack bg={COLOR_PERM} />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
            </RangeSlider>
            <Flex w='100%' fontSize='12px' pt='5px' opacity={p.disabled ? 0.4 : 1}>
                <TypeInfo
                    title={i18n.t(dict.proxy.preparation.typeGeoModel)}
                    percent={ratios.geoModel}
                    color={COLOR_GEO}
                />
                <Delimiter />
                <TypeInfo
                    title={i18n.t(dict.proxy.preparation.typePermeabilities)}
                    percent={ratios.permeabilities}
                    color={COLOR_PERM}
                />
                <Delimiter />
                <TypeInfo
                    title={i18n.t(dict.proxy.preparation.typeSkinFactor)}
                    percent={ratios.skinFactor}
                    color={COLOR_SKIN}
                />
            </Flex>
        </Box>
    );
};

const Delimiter = () => <Spacer flexBasis='16px' />;

const ratiosToPercents = (ratios: AdaptationTypeRatios): Percents => [
    round0(ratios.geoModel),
    round0(ratios.geoModel + ratios.permeabilities)
];

const percentsToRatios = (percents: Percents): AdaptationTypeRatios => ({
    geoModel: percents[0],
    permeabilities: percents[1] - percents[0],
    skinFactor: 100 - percents[1]
});

const getTrackBg = (geoModel: number, permeabilities: number) => {
    const delimiter = Math.round(geoModel + permeabilities / 2);
    return `linear-gradient(to right, ${COLOR_GEO} ${delimiter}%, ${COLOR_SKIN} ${delimiter}%)`;
};
