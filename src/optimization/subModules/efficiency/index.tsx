import React from 'react';
import { Suspense, useEffect } from 'react';

import { HStack } from '@chakra-ui/react';
import { SubModuleType } from 'calculation/enums/subModuleType';
import { displayModeState } from 'commonEfficiency/store/displayMode';
import { submoduleState } from 'optimization/store/submodule';
import { always, cond, equals, T } from 'ramda';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { ContentContainer } from '../../../common/components/contentContainer';
import { DisplayModes } from '../../../common/components/displayModes/displayModes';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { PageRoster } from '../../../common/components/pageRoster';
import { SettingsPanel } from '../../../common/components/settingsPanel';
import { SkeletonBreadcrumb } from '../../../common/components/skeleton/skeletonBreadcrumb';
import { SkeletonSettings } from '../../../common/components/skeleton/skeletonSettings';
import { SkeletonWellRoster } from '../../../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../../../common/components/spinner';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { ActionLinks } from '../preparation/components/actionLinks';
import { Breadcrumb } from '../results/components/breadcrumb';
import { ModuleGtm } from '../results/components/moduleGtm';
import { ExportReport } from './components/exportReport';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { ModuleTabletCanvasWrapper } from './components/moduleTabletCanvasWrapper';
import { ModuleTabletWrapper } from './components/moduleTabletWrapper';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';

export const OptimizationEfficiencyResults = () => {
    const [displayMode, setDisplayMode] = useRecoilState(displayModeState);

    const setCurrentPlastId = useSetRecoilState(currentPlastId);
    const setSubmodule = useSetRecoilState(submoduleState);

    useEffect(() => {
        setSubmodule(SubModuleType.Efficiency);
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
