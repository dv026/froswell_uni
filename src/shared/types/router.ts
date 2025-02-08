import { RouteObject } from 'react-router-dom';

export type AppRoutesProps = RouteObject & {
    authOnly?: boolean;
};
