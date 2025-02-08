import React from 'react';

import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const CalculationNotFound = () => {
    const { t } = useTranslation();

    return (
        <Flex justifyContent='center' alignItems='center'>
            {t(dict.calculation.notFound)}
        </Flex>
    );
};
