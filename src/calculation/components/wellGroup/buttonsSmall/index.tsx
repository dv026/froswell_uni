import React, { FC } from 'react';

import { Flex } from '@chakra-ui/layout';

import { ButtonsOption, IButtonsProps } from '../buttonsOption';
import { LaunchLargeGroupModal } from '../modal/launchLargeGroupModal';

export const ButtonsSmall: FC<IButtonsProps> = (p: IButtonsProps) => {
    return (
        <Flex justify='space-between' align='center'>
            <LaunchLargeGroupModal />
            <ButtonsOption {...p} />
        </Flex>
    );
};
