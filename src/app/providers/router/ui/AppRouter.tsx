import React, { memo, Suspense, useCallback } from 'react';

import { Spinner } from 'common/components/spinner';
import { Route, Routes } from 'react-router-dom';
import { AppRoutesProps } from 'shared/types/router';

import { routeConfig } from '../config/routeConfig';
import { RequireAuth } from '../ui/RequireAuth';

const AppRouter = () => {
    const renderWithWrapper = useCallback((route: AppRoutesProps) => {
        const element = <Suspense fallback={<Spinner />}>{route.element}</Suspense>;

        return (
            <Route
                key={route.path}
                path={route.path}
                element={route.authOnly ? <RequireAuth>{element}</RequireAuth> : element}
            />
        );
    }, []);

    return <Routes>{routeConfig.map(renderWithWrapper)}</Routes>;
};

export default memo(AppRouter);
