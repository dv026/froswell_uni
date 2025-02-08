import React from 'react';

import { Box, FormControl } from '@chakra-ui/react';

interface Props {
    width?: string | number;
    disabled?: boolean;
}

export const SingleField: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return (
        <FormControl w={p.width} variant='brand'>
            <Box width='100%'>{p.children}</Box>
        </FormControl>
    );
};
