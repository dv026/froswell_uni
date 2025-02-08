import React, { useCallback, useEffect, useState } from 'react';

import { CloseButton } from '@chakra-ui/react';
import i18n from 'i18next';

import { SearchIcon } from '../customIcon/general';
import { useDebounce } from '../hooks/useDebounce/useDebounce';

import css from './wellRoster.module.less';

import mainDict from '../../helpers/i18n/dictionary/main.json';

export const SearchField: React.FC<{ text: string; onChange: (x: string) => void }> = ({ text, onChange }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(text);
    }, [text]);

    const debouncedSearch = useDebounce(onChange, 500);

    const onChangeValue = (str: string) => {
        setValue(str);
        debouncedSearch(str);
    };

    return (
        <>
            <SearchIcon boxSize={6} />
            <input
                className={css.roster__search}
                placeholder={i18n.t(mainDict.wellList.findWell)}
                value={value || ''}
                onChange={e => onChangeValue(e.target.value)}
            />
            {text && <CloseButton boxSize={6} onClick={() => onChangeValue('')} />}
        </>
    );
};
