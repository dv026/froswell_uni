import React from 'react';

import { Flex } from '@chakra-ui/react';

import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';

interface IProps {
    className?: string;
}

type Props = ControlWithClassProps & IProps;

export const ContentContainer: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return (
        <Flex className={cls('content-container', p.className)} flex='1 0 auto' width='100%'>
            {p.children}
        </Flex>
    );
};
