import React, { FC, Suspense } from 'react';

import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import i18n from 'i18next';
import { isNil } from 'ramda';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../../calculation/store/calculationMode';
import { proxySharedState } from '../../../../calculation/store/sharedCalculation';
import { SkeletonBreadcrumb } from '../../../../common/components/skeleton/skeletonBreadcrumb';
import { Spinner } from '../../../../common/components/spinner';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { wellListForResults } from '../../../store/wellList';
import { AdaptationParameters } from './adaptationParameters';
import { Breadcrumb } from './breadcrumb';
import { Improvement } from './improvement';
import { Creation } from './сreation';

import dict from './../../../../common/helpers/i18n/dictionary/main.json';

export const BasicSettings = () => {
    const shared = useRecoilValue(proxySharedState);
    const list = useRecoilValue(wellListForResults);

    const setCalculationMode = useSetRecoilState(calculationModeState);

    const emptyList = isNullOrEmpty(list);
    const disabledImprovement = isNullOrEmpty(shared?.templates) || emptyList;

    if (isNil(shared)) {
        return <Spinner show={true} />;
    }

    return (
        <Flex width='100%' flex='0 0 calc(100% - 124px)' overflow='hidden'>
            <Box p={'20px'} w='60%'>
                <Suspense fallback={<SkeletonBreadcrumb />}>
                    <Breadcrumb />
                </Suspense>
                <Box>
                    <Tabs isLazy pt='10px'>
                        <TabList>
                            <Tab onClick={() => setCalculationMode(CalculationModeEnum.Creation)}>
                                {i18n.t(dict.proxy.preparation.creating)}
                            </Tab>
                            <Tab
                                onClick={() => setCalculationMode(CalculationModeEnum.Improvement)}
                                isDisabled={disabledImprovement}
                            >
                                {i18n.t(dict.proxy.preparation.improvement)}
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Creation />
                            </TabPanel>
                            <TabPanel>
                                <Improvement />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
            <AdaptationParameters />
        </Flex>
    );
};
