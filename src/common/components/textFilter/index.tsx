import React, { FC } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import colors from '../../../../theme/colors';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    textFilter: string;
    placeholder?: string;
    handleTextInput(e: React.ChangeEvent<HTMLInputElement>): void;
}

export const TextFilter: FC<IProps> = ({ textFilter, placeholder, handleTextInput }: IProps) => {
    const { t } = useTranslation();
    return (
        <InputGroup>
            <InputLeftElement pointerEvents='none' boxSize='32px'>
                <SearchIcon boxSize={6} color={colors.icons.grey} />
            </InputLeftElement>
            <Input
                placeholder={t(placeholder ?? dict.optimization.searchWell)}
                value={textFilter}
                onChange={handleTextInput}
            />
        </InputGroup>
    );
};
