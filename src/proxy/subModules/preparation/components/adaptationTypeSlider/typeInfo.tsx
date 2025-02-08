import React, { FC } from 'react';

import { Box, Center, Heading } from '@chakra-ui/react';

interface TypeInfoProps {
    /**
     * Название типа адаптации
     */
    title: string;

    /**
     * Процент использования типа адаптации
     */
    percent: number;

    /**
     * Цвет текста в компоненте
     */
    color?: string;
}

export const TypeInfo: FC<TypeInfoProps> = ({ title, percent, color }) => (
    <Box color={color}>
        <Center display='flex' justifyContent='center'>
            {title}
        </Center>
        <Center display='flex' justifyContent='center'>
            <Heading size='h1'>{percent}%</Heading>
        </Center>
    </Box>
);
