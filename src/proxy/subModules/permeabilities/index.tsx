import React, { FC, Suspense } from 'react';

import { ContentContainer } from '../../../common/components/contentContainer';
import { NavigationPanel } from '../../../common/components/navigationPanel';
import { Page } from '../../../common/components/page';
import { PageColumn } from '../../../common/components/pageColumn';
import { SettingsPanel } from '../../../common/components/settingsPanel';
import { Spinner } from '../../../common/components/spinner';
import { ActionLinks } from '../../components/actionLinks';
import { ModuleStages } from '../../components/moduleStages';
import { MainContent } from './components/mainContent';
import { SequentialUserActions } from './components/sequentialUserActions';
import { Settings } from './components/settings';

export const ProxyPermeabilities = () => {
    return (
        <Page>
            <PageColumn>
                <Suspense fallback={<Spinner show={true} />}>
                    <NavigationPanel>
                        <Suspense fallback={<Spinner show={true} />}>
                            <ActionLinks />
                            <ModuleStages />
                        </Suspense>
                    </NavigationPanel>
                    <SettingsPanel noneBackground={true}>
                        <Suspense fallback={<Spinner show={true} />}>
                            <Settings />
                        </Suspense>
                    </SettingsPanel>
                    <ContentContainer>
                        <Suspense fallback={<Spinner show={true} />}>
                            <SequentialUserActions />
                        </Suspense>
                        <Suspense fallback={<Spinner show={true} />}>
                            <MainContent />
                        </Suspense>
                    </ContentContainer>
                </Suspense>
            </PageColumn>
        </Page>
    );
};
