import React, { FC } from 'react';

import { Flex } from '@chakra-ui/layout';
import { Button, ButtonGroup, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { ButtonsOption, IButtonsProps } from '../buttonsOption';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ButtonsLarge: FC<IButtonsProps> = (p: IButtonsProps): JSX.Element => {
    const { t } = useTranslation();
    return (
        <Flex>
            <ButtonsOption {...p} />
            <Spacer />
            <ButtonGroup>
                <Button variant='primary' onClick={p.onClose}>
                    {t(dict.common.ok)}
                </Button>
                <Button onClick={p.onClose} variant='cancel'>
                    {t(dict.common.cancel)}
                </Button>
            </ButtonGroup>
        </Flex>
    );
};
