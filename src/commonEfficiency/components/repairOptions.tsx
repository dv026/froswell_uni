import React from 'react';

import { Box, Center, Flex, HStack, useRadio, useRadioGroup, UseRadioProps } from '@chakra-ui/react';
import { KeyValue } from 'common/entities/keyValue';
import { equals, map } from 'ramda';
import { useTranslation } from 'react-i18next';

import colors from '../../../theme/colors';

import dict from 'common/helpers/i18n/dictionary/main.json';

interface Props {
    selected: number;
    dict: KeyValue[];
    disabled?: boolean;
    onChange: (v) => void;
}

export const RepairOptions: React.FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'rapair',
        defaultValue: p.selected.toString(),
        onChange: id => p.onChange(parseInt(id))
    });

    const group = getRootProps();

    return (
        <Center position={'absolute'} top={'14px'} w={'100%'} zIndex={'popover'}>
            <HStack
                {...group}
                spacing={1}
                border='1px solid'
                borderColor={colors.control.grey300}
                bg={'white'}
                padding={'2px'}
                borderRadius='4px'
            >
                {map(
                    repair => (
                        <RadioCard
                            key={repair.id}
                            {...getRadioProps({ value: repair.id })}
                            isChecked={equals(repair.id, p.selected)}
                            isDisabled={p.disabled}
                        >
                            {repair.name ?? t(dict.efficiency.settings.overallView)}
                        </RadioCard>
                    ),
                    p.dict
                )}
            </HStack>
        </Center>
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
                justifyContent='center'
                cursor='pointer'
                borderRadius='7px'
                boxShadow='none'
                color={colors.typo.primary}
                _checked={{
                    bg: colors.bg.brand,
                    color: colors.icons.white,
                    fontWeight: '600'
                }}
                _focus={{
                    boxShadow: 'none'
                }}
                _disabled={{
                    color: colors.typo.secondary,
                    opacity: 0.5,
                    cursor: 'not-allowed'
                }}
                px='10px'
                minW='100px'
                h='32px'
            >
                {p.children}
            </Flex>
        </Box>
    );
};
