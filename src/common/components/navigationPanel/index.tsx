import React from 'react';

import { Box } from '@chakra-ui/react';

import { ControlWithClassProps } from '../customControl';

interface NavProps {
    disabled?: boolean;
}

type Props = ControlWithClassProps & NavProps;

export const NavigationPanel: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return (
        <Box
            className='navigation-panel'
            p='0 20px'
            minHeight={'124px'}
            flexShrink={0}
            borderBottom='1px'
            borderColor='control.grey300'
        >
            {p.children}
        </Box>
    );
};
