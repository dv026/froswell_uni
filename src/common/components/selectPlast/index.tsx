/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Center, Flex, useRadio, useRadioGroup, UseRadioProps, Wrap, WrapItem } from '@chakra-ui/react';
import i18n from 'i18next';
import { includes } from 'ramda';

import colors from '../../../../theme/colors';
import { KeyValue } from '../../entities/keyValue';
import { isNullOrEmpty } from '../../helpers/ramda';
import { EllipseIcon } from '../customIcon/general';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    selected: number;
    dictionary: KeyValue[];
    problems?: number[];
    onChange: (id: number) => void;
}

export const SelectPlast = (p: Props) => {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'plast',
        value: p.selected ? p.selected.toString() : null,
        onChange: id => p.onChange(parseInt(id))
    });

    const group = getRootProps();

    if (isNullOrEmpty(p.dictionary)) {
        return null;
    }

    const active = (s: KeyValue) => s.id === p.selected;

    return (
        <Flex>
            <Center pr='10px'>
                <span className='plast__title'>{i18n.t(dict.common.plasts)}:</span>
            </Center>
            <Wrap {...group}>
                {p.dictionary.map(value => {
                    const radio = getRadioProps({ value: value.id });
                    return (
                        <WrapItem key={value.id}>
                            <RadioCard
                                key={value.id}
                                {...radio}
                                plastId={value.id}
                                problems={p.problems}
                                isChecked={active(value)}
                            >
                                {value.name}
                            </RadioCard>
                        </WrapItem>
                    );
                })}
            </Wrap>
        </Flex>
    );
};

interface IRadioCardProps {
    plastId: number;
    problems?: number[];
    complete?: boolean;
}

type RadioCardProps = IRadioCardProps & UseRadioProps & React.PropsWithChildren<UseRadioProps>;

export const RadioCard = (p: RadioCardProps) => {
    const { getInputProps, getCheckboxProps } = useRadio(p);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    const getColor = () => {
        if (p.plastId && !isNullOrEmpty(p.problems) && includes(p.plastId, p.problems)) {
            return colors.icons.red;
        }

        if (p.isDisabled) {
            return colors.control.grey300;
        }

        return p.isChecked ? colors.bg.brand : colors.icons.green;
    };

    return (
        <Box as='label'>
            <input {...input} />
            <Flex
                {...checkbox}
                alignItems='center'
                cursor='pointer'
                borderRadius='3px'
                boxShadow='none'
                color={colors.typo.primary}
                _checked={{
                    bg: colors.bg.selected,
                    color: colors.bg.brand,
                    fontWeight: 'bold'
                }}
                _focus={{
                    boxShadow: 'none'
                }}
                _disabled={{
                    color: colors.typo.secondary,
                    cursor: 'not-allowed'
                }}
                pl={'3px'}
                pr={'6px'}
                py={'6px'}
            >
                <EllipseIcon color={getColor()} boxSize={2} mr={'3px'} />
                {p.children}
            </Flex>
        </Box>
    );
};
