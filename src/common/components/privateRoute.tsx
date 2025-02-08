import React from 'react';

import { Navigate, Route } from 'react-router-dom';

import { isLogged, setLocation } from '../../identity/helpers/authHelper';
import { isDemoEnvironment } from '../../identity/helpers/demoHelper';
import { RouteEnum } from '../enums/routeEnum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PrivateRoute: React.FC<any> = ({ element: Element, ...otherProps }) => (
    <Route
        {...otherProps}
        render={props => {
            const isLog = isLogged();
            if (!isLog) {
                setLocation(props.location);
            }

            if (isLog) {
                return <Element {...props} />;
            } else {
                return (
                    <Navigate
                        to={{
                            pathname: isDemoEnvironment() ? RouteEnum.Registration : RouteEnum.Login
                            //state: { from: props.location }
                        }}
                    />
                );
            }
        }}
    />
);
