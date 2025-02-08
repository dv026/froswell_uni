import React, { FC, memo } from 'react';

import { Box, Flex, HStack } from '@chakra-ui/react';

import { TabletViewSetting } from '../../../../../calculation/components/tablet/tabletViewSetting';

export const TabletSettings: FC = memo(() => {
    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    <TabletViewSetting />
                </HStack>
            </Flex>
        </Box>
    );
});
