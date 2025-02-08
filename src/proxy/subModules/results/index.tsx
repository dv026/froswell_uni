import React from 'react';
import { FC, Suspense, useEffect } from 'react';

import { Button, HStack } from '@chakra-ui/react';
import { ExportTablet } from 'input/components/exportTablet';
import { always, cond, equals, T } from 'ramda';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../../../calculation/enums/subModuleType';
import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { ContentContainer } from '../../../common/components/contentContainer';
import { SettingsIcon } from '../../../common/components/customIcon/general';
import { DisplayModes } from '../../../common/components/displayModes/displayModes';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { PageRoster } from '../../../common/components/pageRoster';
import { SettingsPanel } from '../../../common/components/settingsPanel';
import { SkeletonBreadcrumb } from '../../../common/components/skeleton/skeletonBreadcrumb';
import { SkeletonWellRoster } from '../../../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../../../common/components/spinner';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { Breadcrumb } from '../../components/breadcrumb';
import { submoduleState } from '../../store/submodule';
import { ActionLinks } from '../preparation/components/actionLinks';
import { ChartResults } from './components/chartResults';
import { ExportReport } from './components/exportReport';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { ModuleTablet } from './components/moduleTablet';
import { ModuleTabletWrapper } from './components/moduleTabletWrapper';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';
import { chartCompareState } from './store/chartCompare';
import { displayModeState } from './store/displayMode';

export const ProxyResults = () => {
    const [displayMode, setDisplayMode] = useRecoilState(displayModeState);

    const setSubmodule = useSetRecoilState(submoduleState);
    const setPlastId = useSetRecoilState(currentPlastId);

    const resetCompareType = useResetRecoilState(chartCompareState);

    useEffect(() => {
        setSubmodule(SubModuleType.Results);
        setPlastId(null);

        return () => {
            resetCompareType();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Page>
            <PageRoster>
                <Suspense fallback={<SkeletonWellRoster />}>
                    <WellList />
                </Suspense>
            </PageRoster>
            <PageColumn>
                <NavigationPanel>
                    <Suspense fallback={<Spinner show={true} />}>
                        <ActionLinks />
                        <Suspense fallback={<SkeletonBreadcrumb />}>
                            <Breadcrumb />
                        </Suspense>
                        <HStack>
                            <Button variant='tabUnderline' pr={5} isDisabled={true}>
                                <SettingsIcon boxSize={7} color='icons.grey' />
                            </Button>
                            <DisplayModes
                                onChange={setDisplayMode}
                                value={displayMode}
                                modes={[DisplayModeEnum.Chart, DisplayModeEnum.Map, DisplayModeEnum.TabletNew]}
                            />
                        </HStack>
                        <ExportReport />
                        <ExportTablet />
                    </Suspense>
                </NavigationPanel>
                <SettingsPanel>
                    <Suspense fallback={<Spinner show={true} />}>
                        <Settings />
                    </Suspense>
                </SettingsPanel>
                <ContentContainer>
                    <Suspense fallback={<Spinner show={true} />}>{renderContent(displayMode)}</Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};

const renderContent = (type: DisplayModeEnum) =>
    cond([
        [equals(DisplayModeEnum.Chart), always(<ChartResults />)],
        [equals(DisplayModeEnum.Map), always(<ModuleMapWrapper />)],
        [equals(DisplayModeEnum.Tablet), always(<ModuleTablet />)],
        [equals(DisplayModeEnum.TabletNew), always(<ModuleTabletWrapper />)],
        [T, always(null)]
    ])(type);
