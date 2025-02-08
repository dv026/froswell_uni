import React from 'react';
import { FC } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Breadcrumb, BreadcrumbItem, Flex, Skeleton } from '@chakra-ui/react';
import { map } from 'ramda';

export const SkeletonBreadcrumb = () => {
    return (
        <Flex h='30px' alignItems='center'>
            <Breadcrumb colorScheme='blue' separator={<ChevronRightIcon color='gray.500' boxSize={8} />}>
                {map(
                    it => (
                        <BreadcrumbItem key={it.name}>
                            <Skeleton lineHeight='24px' fontSize='20px'>
                                {it.name}
                            </Skeleton>
                        </BreadcrumbItem>
                    ),
                    [
                        { name: 'Чутырская площадь-1' },
                        { name: 'Верейско-башкирский' },
                        { name: 'Июнь 2022' },
                        { name: '601' }
                    ]
                )}
            </Breadcrumb>
        </Flex>
    );
};
