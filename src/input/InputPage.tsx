import React, { Suspense } from 'react';

import { Flex } from '@chakra-ui/react';
import { always, cond, equals, T } from 'ramda';
import { useRecoilState } from 'recoil';

import { ContentContainer } from '../common/components/contentContainer';
import { DisplayModes } from '../common/components/displayModes/displayModes';
import { NavigationPanel } from '../common/components/navigationPanel';
import { Page } from '../common/components/page';
import { PageColumn } from '../common/components/pageColumn';
import { PageRoster } from '../common/components/pageRoster';
import { SettingsPanel } from '../common/components/settingsPanel';
import { SkeletonBreadcrumb } from '../common/components/skeleton/skeletonBreadcrumb';
import { SkeletonSettings } from '../common/components/skeleton/skeletonSettings';
import { SkeletonWellRoster } from '../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../common/components/spinner';
import { DisplayModeEnum } from '../common/enums/displayModeEnum';
import { ActionLinks } from '../myData/components/actionLinks';
import { Breadcrumb } from './components/breadcrumb';
import { ExportMer } from './components/exportMer';
import { ExportTablet } from './components/exportTablet';
import { ModuleChartWrapper } from './components/moduleChartWrapper';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { ModuleTablet } from './components/moduleTablet';
import { ModuleTabletWrapper } from './components/moduleTabletWrapper';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';
import { displayModeState } from './store/displayMode';

const InputPage = () => {
    const [displayMode, setDisplayMode] = useRecoilState(displayModeState);

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
                        <DisplayModes
                            onChange={setDisplayMode}
                            value={displayMode}
                            modes={[DisplayModeEnum.Chart, DisplayModeEnum.Map, DisplayModeEnum.TabletNew]}
                        />
                        <ExportMer />
                        <ExportTablet />
                    </Suspense>
                </NavigationPanel>
                <SettingsPanel>
                    <Suspense fallback={<SkeletonSettings />}>
                        <Settings />
                    </Suspense>
                </SettingsPanel>
                <ContentContainer>
                    <Suspense fallback={<Spinner />}>
                        <Flex direction='column' w='100%'>
                            {renderContent(displayMode)}
                        </Flex>
                    </Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};

export default InputPage;

const renderContent = (type: DisplayModeEnum) =>
    cond([
        [equals(DisplayModeEnum.Chart), always(<ModuleChartWrapper />)],
        [equals(DisplayModeEnum.Map), always(<ModuleMapWrapper />)],
        [equals(DisplayModeEnum.Tablet), always(<ModuleTablet />)],
        [equals(DisplayModeEnum.TabletNew), always(<ModuleTabletWrapper />)],
        [T, always(null)]
    ])(type);
