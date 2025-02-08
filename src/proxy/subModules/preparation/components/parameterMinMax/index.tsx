import React, { FC } from 'react';

import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { FormField } from '../../../../../common/components/formField';
import { InputNumber } from '../../../../../common/components/inputNumber';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface ParameterProps {
    /**
     * Название параметра
     */
    title: string;

    /**
     * Минимальное значение
     */
    min: number;

    /**
     * Максимальное значение
     */
    max: number;

    /**
     * Шаг изменения параметра (по умолчанию = 1)
     */
    step: number;

    /**
     * Обработчик изменения нижней границы значения
     */
    onMinChange: (x: number) => void;

    /**
     * Обработчик изменения верхней границы значения
     */
    onMaxChange: (x: number) => void;
}

type ParameterValueProps = Pick<ParameterProps, 'step'> & { value: number; onChange: (x: number) => void };

/**
 * Компонент для выбора диапазона значения какого-либо параметра
 */
export const ParameterMinMax: FC<ParameterProps> = ({
    title,
    min,
    max,
    onMinChange,
    onMaxChange,
    step = 1
}: ParameterProps) => {
    const { t } = useTranslation();

    const inputWrapperStyles = {
        flex: '0 0 100px',
        margin: '0 6px',
        alignItems: 'center'
    };

    return (
        <FormField title={title}>
            <Flex {...inputWrapperStyles}>
                <ParameterPrefix title={t(dict.proxy.preparation.from)} />
                <ParameterValue value={min} onChange={onMinChange} step={step} />
            </Flex>
            <Flex {...inputWrapperStyles}>
                <ParameterPrefix title={t(dict.proxy.preparation.to)} />
                <ParameterValue value={max} onChange={onMaxChange} step={step} />
            </Flex>
        </FormField>
    );
};

const ParameterValue = ({ value, onChange, step }: ParameterValueProps) => (
    <InputNumber minWidth='70px' step={step} value={value} onChange={val => onChange(+val)} />
);

const ParameterPrefix = ({ title }: { title: string }) => <Box marginRight='6px'>{title}:</Box>;
