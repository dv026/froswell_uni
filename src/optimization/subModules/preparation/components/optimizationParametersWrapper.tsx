import React, { FC } from 'react';

import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { OptimizationParameters } from './optimizationParameters';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const OptimizationParametersWrapper = () => {
    const { t } = useTranslation();
    return (
        <Box className='adaptation-parameters' p={'20px'} bg='bg.grey100' w='40%'>
            <Heading size='h5'>{t(dict.optimization.params)}</Heading>
            <OptimizationParameters />
        </Box>
    );
};
