import React, { Suspense } from 'react';

import { includes } from 'ramda';
import { Outlet, useLocation } from 'react-router-dom';

import { ContentContainer } from '../common/components/contentContainer';
import { NavigationPanel } from '../common/components/navigationPanel';
import { Page } from '../common/components/page';
import { PageColumn } from '../common/components/pageColumn';
import { PageRoster } from '../common/components/pageRoster';
import { SettingsPanel } from '../common/components/settingsPanel';
import { SkeletonWellRoster } from '../common/components/skeleton/skeletonWellRoster';
import { Spinner } from '../common/components/spinner';
import { RouteEnum } from '../common/enums/routeEnum';
import { ActionLinks } from '../myData/components/actionLinks';
import { ButtonTabs } from './components/buttonTabs';
import { CommonStatus } from './components/commonStatus';
import { Settings } from './components/settings';
import { WellList } from './components/wellList';

const UploadPage = () => {
    const location = useLocation();

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
                        <CommonStatus />
                        <ButtonTabs />
                    </Suspense>
                </NavigationPanel>
                <SettingsPanel hide={!includes(RouteEnum.UploadBrand, location.pathname)}>
                    <Suspense fallback={<Spinner show={true} />}>
                        <Settings />
                    </Suspense>
                </SettingsPanel>
                <ContentContainer>
                    <Suspense fallback={<Spinner show={true} />}>
                        <Outlet />
                    </Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};

export default UploadPage;
