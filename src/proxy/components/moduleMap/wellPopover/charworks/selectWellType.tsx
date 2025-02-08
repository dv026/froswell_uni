/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Flex, HStack, useRadio, useRadioGroup, UseRadioProps } from '@chakra-ui/react';

import colors from '../../../../../../theme/colors';
import { DownIcon, DropIcon } from '../../../../../common/components/customIcon/tree';
import { WellTypeEnum } from '../../../../../common/enums/wellTypeEnum';

interface Props {
    selected: WellTypeEnum;
    disabled?: boolean;
    onChange: (v) => void;
}

export const SelectWellType: React.FC<Props> = (p: Props) => {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'type',
        defaultValue: p.selected.toString(),
        onChange: id => p.onChange(parseInt(id))
    });

    const group = getRootProps();

    return (
        <HStack {...group} spacing={1}>
            <RadioCard {...getRadioProps({ value: WellTypeEnum.Oil.toString() })} isDisabled={p.disabled}>
                <DropIcon boxSize={7} />
            </RadioCard>
            <RadioCard {...getRadioProps({ value: WellTypeEnum.Injection.toString() })} isDisabled={p.disabled}>
                <DownIcon boxSize={7} />
            </RadioCard>
        </HStack>
    );
};

type RadioCardProps = UseRadioProps & React.PropsWithChildren<UseRadioProps>;

const RadioCard: React.FC<RadioCardProps> = (props: RadioCardProps) => {
    const { getInputProps, getRadioProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getRadioProps();

    return (
        <Box as='label'>
            <input {...input} />
            <Flex
                {...checkbox}
                alignItems='center'
                justifyContent='center'
                cursor='pointer'
                borderRadius='3px'
                boxShadow='none'
                border='1px solid'
                borderColor={colors.control.grey300}
                background={colors.bg.grey200}
                color={colors.bg.brand}
                _checked={{
                    bg: colors.bg.brand,
                    color: colors.icons.white,
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
                w='40px'
                h='32px'
            >
                {props.children}
            </Flex>
        </Box>
    );
};
