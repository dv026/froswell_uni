import { BreadcrumbControl } from '.';

import React, { FC } from 'react';

import { ArrowRightIcon } from '@chakra-ui/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex } from '@chakra-ui/react';
import { map } from 'ramda';

import css from './index.module.less';

interface Props {
    items: string[][];
}

export const BreadcrumbGroups: FC<Props> = (p: Props) => {
    return (
        <Flex color='bg.brand' alignItems='center'>
            <Breadcrumb
                className={css.navBreadcrumb}
                fontWeight='bold'
                lineHeight='24px'
                fontSize='20px'
                colorScheme='blue'
                separator={<ArrowRightIcon color='gray.500' w={4} h={4} margin={3} />}
            >
                {map(
                    it => (
                        <BreadcrumbItem key={p.items.join()}>
                            <BreadcrumbLink>
                                <BreadcrumbControl items={map(x => ({ name: x }), it)} />
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    ),
                    p.items
                )}
            </Breadcrumb>
        </Flex>
    );
};
