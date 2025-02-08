import React from 'react';

import { isLogged } from 'identity/helpers/authHelper';
import { Navigate, useLocation } from 'react-router-dom';
import { getRouteLogin } from 'shared/const/router';

interface RequireAuthProps {
    children: JSX.Element;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const location = useLocation();

    const auth = isLogged();

    if (!auth) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to={getRouteLogin()} state={{ from: location }} replace />;
    }

    // if (!hasRequiredRoles) {
    //     return <Navigate to={getRouteForbidden()} state={{ from: location }} replace />;
    // }

    return children;
}
