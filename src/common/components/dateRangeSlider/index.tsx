import React from 'react';
import { useState } from 'react';

import {
    RangeSliderFilledTrack,
    RangeSliderMark,
    RangeSliderThumb,
    RangeSliderTrack,
    RangeSlider as ChakraRangeSlider
} from '@chakra-ui/react';

interface Props {
    startDate: Date;
    endDate: Date;
    onChange: (d: number[]) => void;
}

export const RangeSlider: React.FC<Props> = () => {
    const [sliderValue, setSliderValue] = useState<number[]>([20, 50]);

    return (
        <ChakraRangeSlider
            defaultValue={[120, 240]}
            min={0}
            max={300}
            step={30}
            onChange={(val: number[]) => setSliderValue(val)}
        >
            <RangeSliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                25%
            </RangeSliderMark>
            <RangeSliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                50%
            </RangeSliderMark>
            <RangeSliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                75%
            </RangeSliderMark>
            <RangeSliderMark
                value={sliderValue[0]}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='-10'
                ml='-5'
                w='12'
            >
                {sliderValue}%
            </RangeSliderMark>
            <RangeSliderMark
                value={sliderValue[1]}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='10'
                ml='-5'
                w='12'
            >
                {sliderValue}%
            </RangeSliderMark>
            <RangeSliderTrack>
                <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
        </ChakraRangeSlider>
    );
};
