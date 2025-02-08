import React from 'react';
import { Suspense } from 'react';

import { ContentContainer } from '../common/components/contentContainer';
import { Page } from '../common/components/page';
import { PageColumn } from '../common/components/pageColumn';
import { Spinner } from '../common/components/spinner';
import { AdminPanel } from './components/adminPanel';

const PageAccount = () => {
    return (
        <Page>
            <PageColumn>
                <ContentContainer>
                    <Suspense fallback={<Spinner show={true} />}>
                        <AdminPanel />
                    </Suspense>
                </ContentContainer>
            </PageColumn>
        </Page>
    );
};

export default PageAccount;
