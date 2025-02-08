import React, { FC } from 'react';

import { Button, HStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { IFiltersState, IWellGroupsFilters } from '..';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { nul } from '../../../../common/helpers/ramda';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    filters: IWellGroupsFilters[];
    checkedState: IFiltersState;
    checkAll(): void;
    handleCheckboxChange(type: WellTypeEnum): () => void;
}

export const Filters: FC<IProps> = ({ filters, checkedState, checkAll, handleCheckboxChange }: IProps) => {
    const { t } = useTranslation();
    return (
        <HStack spacing={3}>
            <Button
                variant={'wellType'}
                onClick={checkedState.isAllChecked ? nul : checkAll}
                isActive={checkedState.isAllChecked}
            >
                {t(dict.common.all)}
            </Button>
            {filters.map((filter: IWellGroupsFilters, index: number) => {
                const Icon = filter.icon;
                const isSelected = checkedState.checked.indexOf(filter.name) !== -1;

                return (
                    <Button
                        key={`${filter.name}_${index}`}
                        variant={'wellType'}
                        onClick={handleCheckboxChange(filter.name)}
                        isActive={isSelected}
                    >
                        <Icon boxSize={7} />
                    </Button>
                );
            })}
        </HStack>
    );
};
