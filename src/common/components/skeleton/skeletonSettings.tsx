import React from 'react';
import { FC } from 'react';

import { Flex, HStack, Skeleton } from '@chakra-ui/react';

export const SkeletonSettings = () => {
    return (
        <Flex>
            <HStack spacing={4}>
                <Skeleton w='300px' h='36px' />
                <Skeleton w='250px' h='36px' />
                <Skeleton w='250px' h='36px' />
            </HStack>
        </Flex>
    );
};
