import React, { FC } from 'react';

import { Heading, Grid, GridItem, Flex, Box, Spacer, Link, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { CompleteIcon, ExcelIcon } from '../../../common/components/customIcon/general';

import css from './index.module.less';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ActionP = () => {
    const { t } = useTranslation();

    return (
        <div className={css.commonData}>
            <Heading size='h4' textTransform='uppercase'>
                {t(dict.load.dataMain)}
            </Heading>
            <Grid className={css.grid} w='850px' templateColumns='repeat(3, 1fr)' gap={5}>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.mer)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.rigis)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.perforation)} />
                </GridItem>
            </Grid>

            <Heading size='h4' textTransform='uppercase'>
                {t(dict.load.dataAdditional)}
            </Heading>
            <Grid className='grid' w='850px' templateColumns='repeat(3, 1fr)' gap={5}>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.plastCrossing)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.plastContours)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.objectContours)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.physicalProperties)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.plastCharacteristics)} />
                </GridItem>
                <GridItem className={css.gridItem} bg='bg.white'>
                    <Item title={t(dict.load.permeability)} />
                </GridItem>
            </Grid>
        </div>
    );
};

interface ItemProps {
    title: string;
}

const Item: FC<ItemProps> = (p: ItemProps) => {
    const { t } = useTranslation();

    return (
        <Flex direction='column' h='100%'>
            <Box p='8'>
                <Text fontSize='18px' lineHeight='22px'>
                    {p.title}
                </Text>
            </Box>
            <Spacer justifySelf='stretch' />
            <Box px='4'>
                <Link>
                    <ExcelIcon color='icons.grey' boxSize={6} />
                    {t(dict.load.uploadNew)}
                </Link>
            </Box>
            <Box px='4' mb='5'>
                <Link>
                    <ExcelIcon color='icons.grey' boxSize={6} />
                    {t(dict.common.download)}
                </Link>
            </Box>
            <Box position='absolute' top='10px' right='10px'>
                <CompleteIcon color='icons.green' boxSize={6} />
            </Box>
        </Flex>
    );
};
