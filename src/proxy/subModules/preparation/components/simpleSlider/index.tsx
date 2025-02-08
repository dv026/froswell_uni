import React, { FC, useEffect, useState } from 'react';

import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';

//import i18n from 'i18next';
import { round0 } from '../../../../../common/helpers/math';

//import dict from './../../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    value: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    onChange?: (value: number) => void;
}

export const SimpleSlider: FC<Props> = (p: Props) => {
    const [value, setValue] = useState(p.value);
    const [moved, setMoved] = useState(false);

    useEffect(() => {
        setValue(round0(p.value));
    }, [p.value]);

    return (
        <Box p='10px'>
            <Slider
                variant='brand'
                aria-label='slider-ex-4'
                value={value}
                min={p.min}
                max={p.max}
                isDisabled={p.disabled}
                onChangeStart={val => {
                    setMoved(true);
                    setValue(val);
                }}
                onChangeEnd={val => {
                    setMoved(false);
                    setValue(val);
                    p.onChange(val);
                }}
                onChange={val => {
                    setValue(val);

                    if (!moved) {
                        p.onChange(val);
                    }
                }}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </Box>
    );
};
