import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { filter } from 'ramda';
import { useTranslation } from 'react-i18next';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { WellGroupItem } from '../../../entities/wellGroupItem';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export interface IButtonsProps {
    data: WellGroupItem[];
    handleClearAll?: () => void;
    handleSelectAll?: () => void;
    onClose?: () => void;
}

export const ButtonsOption: FC<IButtonsProps> = ({ data, handleClearAll, handleSelectAll }: IButtonsProps) => {
    const { t } = useTranslation();

    const anyWells = !isNullOrEmpty(filter(it => it.selected, data));

    return (
        <ButtonGroup variant='link'>
            {anyWells ? (
                <Button onClick={handleClearAll}>{t(dict.optimization.cancelAll)}</Button>
            ) : (
                <Button onClick={handleSelectAll}>{t(dict.optimization.selectAll)}</Button>
            )}
        </ButtonGroup>
    );
};
