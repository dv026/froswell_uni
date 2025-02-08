import React from 'react';
import { Suspense, useEffect } from 'react';

import { HStack } from '@chakra-ui/react';
import { always, cond, equals, T } from 'ramda';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../../../calculation/enums/subModuleType';
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
import { submoduleState } from '../../store/submodule';
import { ActionLinks } from '../preparation/components/actionLinks';
import { Breadcrumb } from './components/breadcrumb';
import { ExportReport } from './components/exportReport';
import { ExportTablet } from './components/exportTablet';
import { ModuleChart } from './components/moduleChart';
import { ModuleMapWrapper } from './components/moduleMapWrapper';
import { ModuleTablet } from './components/moduleTablet';
import { ModuleTabletWrapper } from './components/moduleTabletWrapper';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';
import { chartCompareState } from './store/chartCompare';
import { currentPlastId } from './store/currentPlastId';
import { displayModeState } from './store/displayMode';

export const PredictionResults = () => {
    const [displayMode, setDisplayMode] = useRecoilState(displayModeState);

    const setCurrentPlastId = useSetRecoilState(currentPlastId);
    const setSubmodule = useSetRecoilState(submoduleState);

    const resetCompareType = useResetRecoilState(chartCompareState);

    useEffect(() => {
        setSubmodule(SubModuleType.Results);
        setCurrentPlastId(null);

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
        [equals(DisplayModeEnum.Chart), always(<ModuleChart />)],
        [equals(DisplayModeEnum.Map), always(<ModuleMapWrapper />)],
        [equals(DisplayModeEnum.Tablet), always(<ModuleTablet />)],
        [equals(DisplayModeEnum.TabletNew), always(<ModuleTabletWrapper />)],
        [T, always(null)]
    ])(type);
