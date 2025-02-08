import React, { CSSProperties, FC } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex } from '@chakra-ui/react';
import { map } from 'ramda';

export interface CrumbType {
    name: string;
    onClick?: () => void;
}

interface Props {
    items: CrumbType[];
}

export const BreadcrumbControl: FC<Props> = (p: Props) => {
    const styles: CSSProperties = {
        maxWidth: '650px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    return (
        <Flex color='bg.brand' h='30px' alignItems='center'>
            <Breadcrumb
                fontWeight='bold'
                lineHeight='24px'
                fontSize='20px'
                colorScheme='blue'
                separator={<ChevronRightIcon color='gray.500' w={7} h={7} />}
            >
                {map(
                    it => (
                        <BreadcrumbItem key={it.name}>
                            <BreadcrumbLink style={styles} onClick={() => it.onClick()}>
                                {it.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    ),
                    p.items
                )}
            </Breadcrumb>
        </Flex>
    );
};
