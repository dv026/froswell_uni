import React from 'react';
import { Suspense, useEffect } from 'react';

import { HStack } from '@chakra-ui/react';
import { ModuleTabletWrapper as ModuleTabletCanvasWrapper } from 'commonEfficiency/components/moduleTabletWrapper';
import { Breadcrumb } from 'input/components/breadcrumb';
import { currentPlastId } from 'input/store/plast';
import { always, cond, equals, T } from 'ramda';
import { useRecoilState, useSetRecoilState } from 'recoil';

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
import { displayModeState } from '../commonEfficiency/store/displayMode';
import { ModuleMapWrapper } from '../inputEfficiency/components/moduleMapWrapper';
import { ModuleTabletWrapper } from '../inputEfficiency/components/moduleTabletWrapper';
import { ActionLinks } from '../myData/components/actionLinks';
import { ExportReport } from './components/exportReport';
import { ModuleGtm } from './components/moduleGtm';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';

export const InputEfficiencyResults = () => {
    const [displayMode, setDisplayMode] = useRecoilState(displayModeState);

    const setCurrentPlastId = useSetRecoilState(currentPlastId);

    useEffect(() => {
        setCurrentPlastId(null);
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
                            <DisplayModes
                                onChange={setDisplayMode}
                                value={displayMode}
                                modes={[DisplayModeEnum.Chart, DisplayModeEnum.Map, DisplayModeEnum.TabletNew]}
                            />
                        </HStack>
                        <ExportReport />
                    </Suspense>
                </NavigationPanel>
                <SettingsPanel>
                    <Suspense fallback={<SkeletonSettings />}>
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
        [equals(DisplayModeEnum.Chart), always(<ModuleGtm />)],
        [equals(DisplayModeEnum.Map), always(<ModuleMapWrapper />)],
        [equals(DisplayModeEnum.Tablet), always(<ModuleTabletWrapper />)],
        [equals(DisplayModeEnum.TabletNew), always(<ModuleTabletCanvasWrapper />)],
        [T, always(null)]
    ])(type);
