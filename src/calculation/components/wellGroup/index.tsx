import React, { useEffect, useState, FC } from 'react';

import { Box, VStack } from '@chakra-ui/layout';
import { Heading } from '@chakra-ui/react';
import { map, filter, when, assoc } from 'ramda';
import { useTranslation } from 'react-i18next';

import { DownIcon, DropAndDownIcon, DropIcon, DropTimeIcon } from '../../../common/components/customIcon/tree';
import { TextFilter } from '../../../common/components/textFilter';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { isNumber } from '../../../common/helpers/types';
import { WellGroupItem } from '../../entities/wellGroupItem';
import { IButtonsProps } from './buttonsOption';
import { Filters } from './filters';
import { OptionsRow } from './optionsRow';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IFilterIconParams {
    isSelected?: boolean;
    boxSize?: number;
}

export interface IWellGroupsFilters {
    name: WellTypeEnum;
    icon: ({ isSelected }: IFilterIconParams) => JSX.Element;
}

export const filters: IWellGroupsFilters[] = [
    {
        name: WellTypeEnum.Oil,
        icon: DropIcon
    },
    {
        name: WellTypeEnum.Injection,
        icon: DropAndDownIcon
    },
    {
        name: WellTypeEnum.Mixed,
        icon: DropTimeIcon
    },
    {
        name: WellTypeEnum.Unknown,
        icon: DownIcon
    }
];

export interface IFiltersState {
    isAllChecked: boolean;
    checked: WellTypeEnum[];
}

const initialCheckedState: IFiltersState = {
    isAllChecked: true,
    checked: []
};

interface IProps {
    key: string;
    size: 'small' | 'large';
    wells: WellGroupItem[];
    buttonGroup?: ({ handleClearAll, handleSelectAll }: IButtonsProps) => JSX.Element;
    onClose?: () => void;
    setWells: (data: WellGroupItem[]) => void;
}

export const Card: FC<IProps> = (p: IProps): JSX.Element => {
    const { t } = useTranslation();

    const [filtersState, setFiltersState] = useState<IFiltersState>(initialCheckedState);
    const [textFilter, setTextFilter] = useState<string>('');
    const [chosenOptions, setChosenOptions] = useState<number[]>(
        map(
            (x: WellGroupItem) => x.id,
            filter(it => it.selected === true, p.wells)
        )
    );
    const [allOptions, setAllOptions] = useState<WellGroupItem[]>(p.wells);

    const handleSetAllFilters = () => {
        setFiltersState({
            isAllChecked: true,
            checked: []
        });
    };

    const handleFiltersChange = (type: WellTypeEnum) => () => {
        const newState: IFiltersState = {
            isAllChecked: true,
            checked: []
        };

        const checked =
            filtersState.checked.indexOf(type) === -1
                ? [...filtersState.checked, type]
                : [...filtersState.checked].filter((checked: WellTypeEnum) => checked !== type);

        if (checked.length !== filters.length && checked.length !== 0) {
            newState.isAllChecked = false;
            newState.checked = checked;
        }

        setFiltersState(newState);
    };

    const handleOptionChoose = (id: number, add: boolean) => () => {
        const chosen =
            chosenOptions.indexOf(id) === -1
                ? [...chosenOptions, id]
                : [...chosenOptions].filter((option: number) => option !== id);

        setChosenOptions(chosen);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isChangingWell = isNumber(id) ? (w: WellGroupItem) => w.id === id : () => true;
        p.setWells(map(when(isChangingWell, assoc('selected', add)), p.wells));
    };

    const handleSelectAll = () => {
        p.setWells(map(assoc('selected', true), p.wells));
    };

    const handleResetAll = () => {
        // setChosenOptions([]);
        setFiltersState({
            isAllChecked: true,
            checked: []
        });
        setTextFilter('');

        p.setWells(map(assoc('selected', false), p.wells));
    };

    const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTextFilter(value);
    };

    useEffect(() => {
        const filteredOptions = [
            ...(filtersState.isAllChecked
                ? p.wells
                : p.wells.filter((option: WellGroupItem) => filtersState.checked.indexOf(option.type) !== -1))
        ].filter((option: WellGroupItem) => option.name.includes(textFilter));
        setAllOptions(filteredOptions);
        setChosenOptions(
            map(
                (x: WellGroupItem) => x.id,
                filter(it => it.selected === true, filteredOptions)
            )
        );
    }, [p.wells, textFilter, filtersState]);

    if (isNullOrEmpty(p.wells)) {
        return null;
    }

    const ButtonGroup = p.buttonGroup;

    return (
        <Box w={`${p.size === 'large' ? '100%' : '282px'}`}>
            <VStack align='stretch'>
                <Heading size='h3'>{t(dict.optimization.wellGroups)}</Heading>
                <TextFilter textFilter={textFilter} handleTextInput={handleTextInput} />
                <Filters
                    filters={filters}
                    checkedState={filtersState}
                    checkAll={handleSetAllFilters}
                    handleCheckboxChange={handleFiltersChange}
                />
                <Box maxH='298px'>
                    <OptionsRow
                        options={allOptions}
                        chosenOptions={chosenOptions}
                        isLarge={p.size === 'large'}
                        handleOptionClick={handleOptionChoose}
                    />
                </Box>
                <ButtonGroup
                    data={p.wells}
                    handleClearAll={handleResetAll}
                    handleSelectAll={handleSelectAll}
                    onClose={p.onClose}
                />
            </VStack>
        </Box>
    );
};
