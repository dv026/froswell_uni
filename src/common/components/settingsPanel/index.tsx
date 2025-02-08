import React, { FC, PropsWithChildren } from 'react';

import { Box, Flex } from '@chakra-ui/react';

import { cls } from '../../helpers/styles';
import { ControlWithClassProps } from '../customControl';

interface IProps {
    disabled?: boolean;
    hide?: boolean;
    noneBackground?: boolean;
}

type Props = ControlWithClassProps & IProps;

export const SettingsPanel: FC<PropsWithChildren<Props>> = (p: PropsWithChildren<Props>) => {
    if (p.hide) {
        return null;
    }

    return (
        <Box
            className={cls('settings', p.className)}
            minHeight='46px'
            borderBottom='1px'
            borderColor='control.grey300'
            backgroundColor={p.noneBackground ? 'none' : 'bg.grey100'}
        >
            <Flex p='5px 20px' h='100%'>
                {p.children}
            </Flex>
        </Box>
    );
};
