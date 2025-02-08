import React, { useRef, useState, FC, useEffect } from 'react';

import { Box, Flex, Slider as ChakraSlider, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';

import { round0, round1 } from '../../../../../common/helpers/math';
import { cls } from '../../../../../common/helpers/styles';
import { SliderTypes } from '../../enums/sliderTypes';

import css from './index.module.less';

interface IProps {
    min: { value: number; view: string };
    max: { value: number; view: string };
    dataset: { value: number; mark: string }[];
    value: number;
    type: SliderTypes;
    onChange(value: number): void;
}

export const Slider: FC<IProps> = ({ min, max, dataset, value, type, onChange }: IProps): JSX.Element => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [rangeValue, setRangeValue] = useState<number>(value);

    useEffect(() => {
        setRangeValue(value);
    }, [value]);

    return (
        <Flex alignItems='center' w='100%'>
            <Text>{min.view}</Text>
            <Box w='100%' mx={2}>
                <ChakraSlider
                    m='20px 0 5px'
                    min={min.value}
                    max={max.value}
                    step={1}
                    ref={ref}
                    value={rangeValue}
                    onChange={setRangeValue}
                    onChangeEnd={onChange}
                    h='60px'
                >
                    <SliderTrack position='inherit' bg='linear-gradient(270deg, #3B9CE2 0%, #7A6759 103.11%)' />
                    <SliderThumb
                        bg='#3B9CE2'
                        width={2}
                        height='55px'
                        sx={{
                            borderRadius: '1px',
                            _active: {
                                transform: 'translateY(-50%) scale(1.02)'
                            }
                        }}
                    >
                        <Text marginTop='-80px'>{round0(rangeValue)}</Text>
                    </SliderThumb>

                    {dataset.map((option: { value: number; mark: string }, index: number) => {
                        if (!option?.value) {
                            return null;
                        }

                        return (
                            <Box
                                key={index}
                                as='span'
                                className={cls(
                                    css.mark,
                                    type === SliderTypes.Pressure
                                        ? index
                                            ? css.mark_pressure2
                                            : css.mark_pressure1
                                        : css.mark_skinFactor
                                )}
                                sx={{
                                    left: `calc(${
                                        ((option.value - min.value) / (max.value - min.value)) * 100
                                    }% - 3.5px)`
                                }}
                                visibility={!index && option.value === rangeValue ? 'hidden' : 'visible'}
                                _before={{
                                    content: `"${round1(option.value)}"`
                                }}
                            />
                        );
                    })}
                </ChakraSlider>
            </Box>

            <Text>{max.view}</Text>
        </Flex>
    );
};
