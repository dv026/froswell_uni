import { always, eqBy, head, ifElse, isNil, reject, split } from 'ramda';

import { isNullOrEmpty } from '../helpers/ramda';

export enum RouteEnum {
    Account = '/account',
    Efficiency = '/efficiency',
    EfficiencyPreparation = '/efficiency/preparation',
    EfficiencyResults = '/efficiency/results',
    Filtration = '/filtration',
    GeologicalModel = '/geological-model',
    Home = '/',
    Input = '/input',
    InputEfficiency = '/input/efficiency',
    Login = '/login',
    Proxy = '/proxy',
    ProxyPreparation = '/proxy/preparation',
    ProxyCalculation = '/proxy/calculation',
    ProxyResults = '/proxy/results',
    ProxyEfficiency = '/proxy/efficiency',
    Prediction = '/prediction',
    PredictionPreparation = '/prediction/preparation',
    PredictionCalculation = '/prediction/calculation',
    PredictionResults = '/prediction/results',
    PredictionEfficiency = '/prediction/efficiency',
    Optimization = '/optimization',
    OptimizationPreparation = '/optimization/preparation',
    OptimizationCalculation = '/optimization/calculation',
    OptimizationResults = '/optimization/results',
    OptimizationEfficiency = '/optimization/efficiency',
    Registration = '/registration',
    Upload = '/upload',
    UploadBrand = '/upload/brand',
    UploadDataPlast = '/upload/data-plast',
    UploadDataWell = '/upload/data-well',
    UploadGeologicalProperties = '/upload/geological-properties',
    UploadPhysicalProperties = '/upload/physical-properties',
    Forbidden = '/forbidden'
}

export const appModules = [
    RouteEnum.Account,
    RouteEnum.Efficiency,
    RouteEnum.Filtration,
    RouteEnum.Input,
    RouteEnum.Optimization,
    RouteEnum.Prediction,
    RouteEnum.Proxy,
    RouteEnum.Registration,
    RouteEnum.Upload
];

export enum RouteUploadEnum {
    UploadCommon = '*',
    UploadBrand = 'brand',
    UploadDataPlast = 'data-plast',
    UploadDataWell = 'data-well'
}

export enum RouteInputEnum {
    Upload = 'upload',
    Common = 'common',
    Efficiency = 'efficiency'
}

export enum RouteProxyEnum {
    Preparation = 'preparation',
    Calculation = 'calculation',
    Efficiency = 'efficiency',
    Results = 'results'
}

export enum RouteParamEnum {
    SubModule = '/:subModule?'
}

const splitBySlash = x => reject(isNullOrEmpty, split('/', x));

export const isRouteOfModule = (route: string, mdl: RouteEnum): boolean =>
    ifElse(
        () => isNil(route),
        always(false),
        eqBy(x => head(splitBySlash(x) || ['']), route)
    )(mdl);
