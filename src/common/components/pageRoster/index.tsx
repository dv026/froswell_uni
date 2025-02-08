import React from 'react';

import { Box } from '@chakra-ui/react';

import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';

interface IProps {
    className?: string;
}

type Props = ControlWithClassProps & IProps;

export const PageRoster: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return (
        <Box className={cls('pageRoster', p.className)} h='100%'>
            {p.children}
        </Box>
    );
};
