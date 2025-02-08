import React, { FC, memo } from 'react';

import { Center } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';

import { dbState } from '../../../maintain/store/db';

export const CurrentDb: FC = memo(() => {
    const db = useRecoilValue(dbState);

    return (
        <Center mb='10px' color='white' opacity='.5'>
            {db}
        </Center>
    );
});
