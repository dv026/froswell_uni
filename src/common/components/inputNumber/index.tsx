import React, { FC, useEffect, useState } from 'react';

import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputProps,
    NumberInputStepper
} from '@chakra-ui/react';

interface Props extends NumberInputProps {
    /**
     * Если true, то внешний callback на изменение значения вызывается только после окончания ввода значения (focus out
     * контрола)
     */
    changeOnBlurOnly?: boolean;
}

const getValue = (value: number | string) => (value ? value.toString() : '0');

export const InputNumber: FC<Props> = (p: Props) => {
    const [value, setValue] = useState<string>(getValue(p.value));

    const changeOnBlurOnly = p.changeOnBlurOnly ?? false;

    useEffect(() => {
        setValue(getValue(p.value));
    }, [p.value]);

    const handleBlur = () => changeOnBlurOnly && p.onChange(value, +value);

    const handleValueChange = (s: string, n: number) => {
        setValue(s);

        !changeOnBlurOnly && p.onChange(s, n);
    };

    return (
        <NumberInput {...p} value={value} onChange={handleValueChange} onBlur={handleBlur}>
            <NumberInputField />
            <NumberInputStepper color='control.grey400'>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    );
};
