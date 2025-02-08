/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Flex, HStack, useRadio, useRadioGroup, UseRadioProps } from '@chakra-ui/react';
import { map } from 'ramda';

import colors from '../../../../theme/colors';
import { KeyValue } from '../../entities/keyValue';

interface Props {
    selected: number;
    dictionary: KeyValue[];
    disabled?: boolean;
    onChange: (v) => void;
}

export const SelectPlastSimple: React.FC<Props> = (p: Props) => {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'type',
        defaultValue: p.selected.toString(),
        onChange: id => p.onChange(parseInt(id))
    });

    const group = getRootProps();

    return (
        <HStack {...group} spacing={1} flexWrap='wrap' my={1}>
            {map((value: KeyValue) => {
                const radio = getRadioProps({ value: value.id });
                return (
                    <RadioCard key={value.id} {...radio} isChecked={value.id === p.selected} isDisabled={p.disabled}>
                        {value.name}
                    </RadioCard>
                );
            }, p.dictionary)}
        </HStack>
    );
};

type RadioCardProps = UseRadioProps & React.PropsWithChildren<UseRadioProps>;

const RadioCard: React.FC<RadioCardProps> = (p: RadioCardProps) => {
    const { getInputProps, getCheckboxProps } = useRadio(p);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as='label'>
            <input {...input} />
            <Flex
                {...checkbox}
                alignItems='center'
                background={colors.bg.grey200}
                border='1px solid'
                borderColor={colors.control.grey300}
                borderRadius='3px'
                boxShadow='none'
                color={colors.typo.primary}
                cursor='pointer'
                h='32px'
                justifyContent='center'
                px={2}
                _checked={{
                    bg: colors.bg.brand,
                    color: colors.typo.light,
                    fontWeight: 'bold'
                }}
                _focus={{
                    boxShadow: 'none'
                }}
                _disabled={{
                    color: colors.typo.secondary,
                    opacity: 0.5,
                    cursor: 'not-allowed'
                }}
            >
                {p.children}
            </Flex>
        </Box>
    );
};
