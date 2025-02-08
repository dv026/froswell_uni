import React from 'react';

import { QuestionIcon } from '@chakra-ui/icons';
import { HStack, Text } from '@chakra-ui/layout';
import { Checkbox, SimpleGrid } from '@chakra-ui/react';

import { filters, IWellGroupsFilters } from '..';
import colors from '../../../../../theme/colors';
import { WellGroupItem } from '../../../entities/wellGroupItem';

interface IProps {
    options: WellGroupItem[];
    chosenOptions: number[];
    isLarge?: boolean;
    handleOptionClick(id: number, add: boolean): () => void;
}

export const OptionsRow = ({ options, chosenOptions, isLarge, handleOptionClick }: IProps): JSX.Element => (
    <SimpleGrid maxH='298px' columns={isLarge ? 4 : 1} gap={1} spacing={1} overflowY={'auto'}>
        {options.map((option: WellGroupItem) => {
            const Icon =
                filters.find((filter: IWellGroupsFilters) => filter.name === option.type)?.icon || QuestionIcon;
            return (
                <HStack key={String(option.id)} spacing={3} m={0}>
                    <Checkbox
                        id={String(option.id)}
                        onChange={handleOptionClick(option.id, !option.selected)}
                        isChecked={chosenOptions.indexOf(option.id) !== -1}
                    />
                    <Icon boxSize={7} color={colors.bg.brand} />
                    <Text>{option.name}</Text>
                </HStack>
            );
        })}
    </SimpleGrid>
);
