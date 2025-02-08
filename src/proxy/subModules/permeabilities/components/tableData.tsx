import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { dataState } from '../store/data';
import { paramsState } from '../store/params';
import { Grid } from './grid';

export const TableData = () => {
    const data = useRecoilValue(dataState);
    const params = useRecoilValue(paramsState);

    if (!data || isNullOrEmpty(data.known)) {
        return null;
    }

    return (
        <Box className='permeability-grid' w='763px' h='500px'>
            <Grid constants={data.constants} stepSize={params.stepSize} />
        </Box>
    );
};
