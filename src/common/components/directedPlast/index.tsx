import React, { Fragment } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Center, Flex, useRadioGroup, Wrap, WrapItem } from '@chakra-ui/react';
import i18n from 'i18next';
import { equals, includes, map, takeWhile } from 'ramda';

import { KeyValue } from '../../entities/keyValue';
import { isNullOrEmpty, mapIndexed } from '../../helpers/ramda';
import { RadioCard } from '../selectPlast';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    selected: number;
    dictionary: KeyValue[];
    problems?: number[];
    onChange: (id: number) => void;
}

export const DirectedPlast: React.FC<Props> = (p: Props) => {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'plast',
        value: p.selected.toString(),
        onChange: id => p.onChange(parseInt(id))
    });

    if (isNullOrEmpty(p.dictionary)) {
        return null;
    }

    const group = getRootProps();

    const checkedStages = takeWhile(x => !equals(x.id, p.selected), p.dictionary);

    const active = (s: KeyValue) => s.id === p.selected;
    const complete = (s: KeyValue) =>
        includes(
            s,
            map(x => x, checkedStages)
        );
    const disabled = (s: KeyValue) => !active(s) && !complete(s);

    return (
        <Flex>
            <Center pr='10px'>
                <span className='plast__title'>{i18n.t(dict.common.plasts)}:</span>
            </Center>
            <Wrap {...group} spacing={0}>
                {mapIndexed((value: KeyValue, index: number) => {
                    const radio = getRadioProps({ value: value.id });
                    return (
                        <Fragment key={value.id}>
                            <WrapItem>
                                <RadioCard
                                    key={value.id}
                                    {...radio}
                                    plastId={value.id}
                                    problems={p.problems}
                                    isChecked={active(value)}
                                    complete={complete(value)}
                                    isDisabled={disabled(value)}
                                >
                                    {value.name}
                                </RadioCard>
                            </WrapItem>
                            {index !== p.dictionary.length - 1 ? (
                                <Center>
                                    <ChevronRightIcon color='icons.grey' boxSize={6} />
                                </Center>
                            ) : null}
                        </Fragment>
                    );
                }, p.dictionary)}
            </Wrap>
        </Flex>
    );
};
