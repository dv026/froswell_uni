import React, { FC, Suspense, useEffect } from 'react';

import { Flex } from '@chakra-ui/react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { SubModuleType } from '../../../calculation/enums/subModuleType';
import { calculationModeState } from '../../../calculation/store/calculationMode';
import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageRoster } from '../../../common/components/pageRoster';
import { SkeletonWellRoster } from '../../../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../../../common/components/spinner';
import { ModuleStages } from '../../components/moduleStages';
import { WellList } from '../../components/wellList';
import { submoduleState } from '../../store/submodule';
import { ActionLinks } from './components/actionLinks';
import { BasicSettings } from './components/basicSettings';

export const ProxyPreparation = () => {
    const setCalculationMode = useSetRecoilState(calculationModeState);
    const setSubmodule = useSetRecoilState(submoduleState);

    const resetCurrentPlastId = useResetRecoilState(currentPlastId);

    useEffect(() => {
        resetCurrentPlastId();

        setSubmodule(SubModuleType.Calculation);
        setCalculationMode(CalculationModeEnum.Creation);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Page>
            <PageRoster>
                <Suspense fallback={<SkeletonWellRoster />}>
                    <WellList />
                </Suspense>
            </PageRoster>
            <Flex height='100%' flex='1 1 100%' overflow='hidden' direction='column'>
                <NavigationPanel>
                    <Suspense fallback={<Spinner show={true} />}>
                        <ActionLinks />
                        <ModuleStages />
                    </Suspense>
                </NavigationPanel>

                <Suspense fallback={<Spinner show={true} />}>
                    <BasicSettings />
                </Suspense>
            </Flex>
        </Page>
    );
};
