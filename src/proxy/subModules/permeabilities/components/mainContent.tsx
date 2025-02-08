import React, { FC } from 'react';

import { Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { dataState } from '../store/data';
import { ChartData } from './chartData';
import { TableData } from './tableData';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const MainContent = () => {
    const { t } = useTranslation();

    const params = useRecoilValue(dataState);

    const disabled = isNullOrEmpty(params?.known);

    return (
        <Box p={'20px'}>
            <Heading size='h3'>{t(dict.proxy.permeabilities.relativeCalculationPhasePermeabilities)}</Heading>
            <Tabs isLazy pt='10px'>
                <TabList>
                    <Tab isDisabled={disabled}>{t(dict.common.chart)}</Tab>
                    <Tab isDisabled={disabled}>{t(dict.proxy.table)}</Tab>
                </TabList>
                <TabPanels pt={4}>
                    <TabPanel>
                        <ChartData />
                    </TabPanel>
                    <TabPanel>
                        <TableData />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};
