import { RouteEnum, RouteParamEnum } from 'common/enums/routeEnum';

export enum AppRoutes {
    MAIN = 'main',
    UPLOAD = 'upload',
    INPUT = 'input',
    GEOLOGICAL_MODEL = 'geological_model',
    FILTRATION = 'filtration',
    PROXY = 'proxy',
    PREDICTION = 'prediction',
    OPTIMIZATION = 'optimization',
    ACCOUNT = 'account',
    LOGIN = 'local',
    REGISTRATION = 'registration',
    FORBIDDEN = 'forbidden',
    // last
    NOT_FOUND = 'not_found'
}

export const getRouteMain = () => RouteEnum.Home;
export const getRouteUpload = () => RouteEnum.Upload + RouteParamEnum.SubModule;
export const getRouteInput = () => RouteEnum.Input;
export const getRouteInputEfficiency = () => RouteEnum.InputEfficiency;
export const getRouteGeologicalModel = () => RouteEnum.GeologicalModel;
export const getRouteFiltration = () => RouteEnum.Filtration;
export const getRouteProxy = () => RouteEnum.Proxy + RouteParamEnum.SubModule;
export const getRoutePrediction = () => RouteEnum.Prediction + RouteParamEnum.SubModule;
export const getRouteOptimization = () => RouteEnum.Optimization + RouteParamEnum.SubModule;
export const getRouteAccount = () => RouteEnum.Account;
export const getRouteLogin = () => RouteEnum.Login;
export const getRouteRegistration = () => RouteEnum.Registration;
export const getRouteForbidden = () => RouteEnum.Forbidden;
export const getRouteNotFound = () => '*';

export const AppRouteByPathPattern: Record<string, AppRoutes> = {
    [getRouteMain()]: AppRoutes.MAIN,
    [getRouteUpload()]: AppRoutes.UPLOAD,
    [getRouteInput()]: AppRoutes.INPUT,
    [getRouteGeologicalModel()]: AppRoutes.GEOLOGICAL_MODEL,
    [getRouteFiltration()]: AppRoutes.FILTRATION,
    [getRouteProxy()]: AppRoutes.PROXY,
    [getRoutePrediction()]: AppRoutes.PREDICTION,
    [getRouteOptimization()]: AppRoutes.OPTIMIZATION,
    [getRouteAccount()]: AppRoutes.ACCOUNT,
    [getRouteLogin()]: AppRoutes.LOGIN,
    [getRouteRegistration()]: AppRoutes.REGISTRATION,
    [getRouteForbidden()]: AppRoutes.FORBIDDEN,
    [getRouteNotFound()]: AppRoutes.NOT_FOUND
};
