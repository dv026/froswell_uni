import React, { Suspense } from 'react';

import { Spinner } from 'common/components/spinner';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { getRouteLogin } from '../../../../shared/const/router';
import { isLogged } from './../../../../identity/helpers/authHelper';

export function AuthOutlet() {
    const location = useLocation();

    const auth = isLogged();

    if (!auth) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to={getRouteLogin()} state={{ from: location }} replace />;
    }

    return (
        <Suspense fallback={<Spinner />}>
            <Outlet />
        </Suspense>
    );
}
