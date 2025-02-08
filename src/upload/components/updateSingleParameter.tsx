import React, { FC } from 'react';

import { Box, HStack } from '@chakra-ui/react';

import { InputNumber } from '../../common/components/inputNumber';
import { round2 } from '../../common/helpers/math';

export interface UpdateSingleParameterProps {
    title: string;
    value: number;
    onChange: (value: number) => void;
}

export const UpdateSingleParameter: FC<UpdateSingleParameterProps> = (props: UpdateSingleParameterProps) => {
    const { title, onChange } = props;

    return (
        <>
            <HStack spacing='10px' p='5px 0'>
                <Box w='65%'>{title}:</Box>
                <Box w='100px'>
                    <InputNumber
                        width={'90px'}
                        value={round2(props.value)}
                        onChange={(s: string, n: number) => {
                            onChange(n);
                        }}
                    />
                </Box>
            </HStack>
        </>
    );
};
