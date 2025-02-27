import React, { Suspense } from 'react';

import { ContentContainer } from '../common/components/contentContainer';
import { NavigationPanel } from '../common/components/navigationPanel';
import { Page } from '../common/components/page';
import { PageColumn } from '../common/components/pageColumn';
import { PageRoster } from '../common/components/pageRoster';
import { SettingsPanel } from '../common/components/settingsPanel';
import { SkeletonBreadcrumb } from '../common/components/skeleton/skeletonBreadcrumb';
import { SkeletonSettings } from '../common/components/skeleton/skeletonSettings';
import { SkeletonWellRoster } from '../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../common/components/spinner';
import { ActionLinks } from '../preparation/components/actionLinks';
import { Breadcrumb } from './components/breadcrumb';
import { CalculationParams } from './components/calculationParams';
import { ModuleChart } from './components/moduleChart';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';

const FiltrationPage = () => {
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
                    </Suspense>
                </NavigationPanel>
                <SettingsPanel>
                    <Suspense fallback={<SkeletonSettings />}>
                        <Settings />
                    </Suspense>
                </SettingsPanel>
                <ContentContainer>
                    <Suspense fallback={<Spinner show={true} />}>
                        <CalculationParams />
                        <ModuleChart />
                    </Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};

export default FiltrationPage;
