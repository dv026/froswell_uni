import React from 'react';

import { Stack, Flex } from '@chakra-ui/react';
import { map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { BreadcrumbControl } from '../../../common/components/breadcrumbControl';
import { selectedOilFieldName } from '../../store/currentOilfield';
import { TotalPercent } from './totalPercent';

export const CommonStatus: React.FC = () => {
    const names = useRecoilValue(selectedOilFieldName);

    return (
        <Flex color='bg.brand' h='30px' alignItems='center'>
            <Stack direction={['row']} spacing={50} align='center'>
                <BreadcrumbControl items={map(it => ({ name: it.name }), names)} />
                <TotalPercent />
            </Stack>
        </Flex>
    );
};
