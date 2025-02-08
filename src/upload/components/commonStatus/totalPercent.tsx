import React, { FC } from 'react';

import { Box, Skeleton, Tag } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilValueLoadable } from 'recoil';

import { hasValue } from '../../../common/helpers/recoil';
import { fillPercentSelector } from '../../store/fillPercent';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const TotalPercent = () => {
    const { t } = useTranslation();

    const fillPercentLoadable = useRecoilValueLoadable(fillPercentSelector);

    const isLoaded = hasValue(fillPercentLoadable);

    return (
        <Box>
            <span>
                {t(dict.load.baseIsFull)} {t(dict.load.on)}{' '}
            </span>
            <Tag bg='control.lightGreen' size='md' textColor='typo.primary' fontWeight='bold' textAlign={'center'}>
                <Skeleton isLoaded={isLoaded} w='50px'>
                    {fillPercentLoadable ? fillPercentLoadable.contents.totalFillPercent : 0}%
                </Skeleton>
            </Tag>
        </Box>
    );
};
