import React, { FC, useState } from 'react';

import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '../customIcon/general';

import dict from '../../helpers/i18n/dictionary/main.json';

interface IProps {
    onSearch: (str: string) => void;
}

export const SearchTool: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    const [value, setValue] = useState<string>('');

    const handleKeyDown = event => {
        if (event.key === 'Enter') {
            p.onSearch(value);
        }
    };

    return (
        <InputGroup size='md' w='90px' minH='35px'>
            <Input
                h='100%'
                pr='2.5rem'
                background='white'
                type='text'
                value={value}
                placeholder={t(dict.common.wellAbbr)}
                onKeyDown={handleKeyDown}
                onChange={e => setValue(e.target.value)}
            />
            <InputRightElement width='2.5rem' h='100%'>
                <Button type='submit' variant='unstyled' onClick={() => p.onSearch(value)}>
                    <SearchIcon boxSize={6} />
                </Button>
            </InputRightElement>
        </InputGroup>
    );
};
