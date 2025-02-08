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
import { Settings } from './components/settings';
import { ToolControls } from './components/toolControls';

export const OptimizationTargets = () => {
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
                    <SettingsPanel>
                        <Suspense fallback={<Spinner show={true} />}>
                            <Settings />
                        </Suspense>
                    </SettingsPanel>
                    <ContentContainer>
                        <Suspense fallback={<Spinner show={true} />}>
                            <ToolControls />
                            <MainContent />
                        </Suspense>
                    </ContentContainer>
                </Suspense>
            </PageColumn>
        </Page>
    );
};
