import { memo, Suspense } from 'react';
import React from 'react';

import { createStandaloneToast } from '@chakra-ui/react';
import { ErrorBoundaryFallbackComponent } from 'common/containers/errorBoundary/errorBoundaryFallbackComponent';
import { ErrorBoundary } from 'react-error-boundary';

import { Stairway } from '../common/components/stairway';
import { AuthOutlet } from './providers/router/ui/AuthOutlet';

const { ToastContainer } = createStandaloneToast();

const RootLayout = memo(function RootLayout() {
    return (
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallbackComponent} onError={console.error}>
            <Stairway />
            <AuthOutlet />
            <ToastContainer />
        </ErrorBoundary>
    );
});

export default RootLayout;
