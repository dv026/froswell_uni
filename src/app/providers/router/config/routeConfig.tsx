import React from 'react';

import { AccountPage } from 'account';
import { PageNotFound } from 'common/containers/notFound';
import { RouteProxyEnum, RouteUploadEnum } from 'common/enums/routeEnum';
import { FiltrationPage } from 'filtration';
import { GeologicalModelPage } from 'geologicalModel';
import { LoginPage, RegistrationPage, ForbiddenPage } from 'identity';
import { InputPage } from 'input';
import { OptimizationPage } from 'optimization';
import { OptimizationPreparationStage } from 'optimization/components/optimizationPreparationStage';
import { OptimizationCalculation } from 'optimization/subModules/calculation';
import { OptimizationEfficiencyResults } from 'optimization/subModules/efficiency';
import { OptimizationResults } from 'optimization/subModules/results';
import { PredictionPage } from 'prediction';
import { PredictionPreparationStage } from 'prediction/components/predictionPreparationStage';
import { PredictionCalculation } from 'prediction/subModules/calculation';
import { PredictionEfficiencyResults } from 'prediction/subModules/efficiency';
import { PredictionResults } from 'prediction/subModules/results';
import { ProxyPage } from 'proxy';
import { ProxyPreparationStage } from 'proxy/components/proxyPreparationStage';
import { ProxyCalculation } from 'proxy/subModules/calculation';
import { ProxyEfficiencyResults } from 'proxy/subModules/efficiency';
import { ProxyResults } from 'proxy/subModules/results';
import {
    getRouteAccount,
    getRouteFiltration,
    getRouteForbidden,
    getRouteGeologicalModel,
    getRouteInput,
    getRouteInputEfficiency,
    getRouteLogin,
    getRouteMain,
    getRouteOptimization,
    getRoutePrediction,
    getRouteProxy,
    getRouteRegistration,
    getRouteUpload
} from 'shared/const/router';
import { AppRoutesProps } from 'shared/types/router';
import { UploadPage } from 'upload';
import { CommonData } from 'upload/components/commonData';
import { UploadBrand } from 'upload/components/uploadBrand';
import { UploadedPlasts } from 'upload/components/uploadedPlasts';
import { UploadedWells } from 'upload/components/uploadedWells';

import { InputEfficiencyResults } from '../../../../inputEfficiency';
import RootLayout from '../../../rootLayout';

export const routeConfig: AppRoutesProps[] = [
    {
        element: <RootLayout />,
        authOnly: true,
        children: [
            {
                path: getRouteMain(),
                element: <InputPage />
            },
            {
                path: getRouteInput(),
                element: <InputPage />
            },
            {
                path: getRouteInputEfficiency(),
                element: <InputEfficiencyResults />
            },
            {
                path: getRouteGeologicalModel(),
                element: <GeologicalModelPage />
            },
            {
                path: getRouteUpload(),
                element: <UploadPage />,
                children: [
                    { path: RouteUploadEnum.UploadCommon, index: true, element: <CommonData /> },
                    { path: RouteUploadEnum.UploadDataPlast, element: <UploadedPlasts /> },
                    { path: RouteUploadEnum.UploadDataWell, element: <UploadedWells /> },
                    { path: RouteUploadEnum.UploadBrand, element: <UploadBrand /> }
                ]
            },
            {
                path: getRouteFiltration(),
                element: <FiltrationPage />
            },
            {
                path: getRouteProxy(),
                element: <ProxyPage />,
                children: [
                    { path: RouteProxyEnum.Preparation, index: true, element: <ProxyPreparationStage /> },
                    { path: RouteProxyEnum.Calculation, element: <ProxyCalculation /> },
                    { path: RouteProxyEnum.Results, element: <ProxyResults /> },
                    { path: RouteProxyEnum.Efficiency, element: <ProxyEfficiencyResults /> }
                ]
            },
            {
                path: getRoutePrediction(),
                element: <PredictionPage />,
                children: [
                    { path: RouteProxyEnum.Preparation, index: true, element: <PredictionPreparationStage /> },
                    { path: RouteProxyEnum.Calculation, element: <PredictionCalculation /> },
                    { path: RouteProxyEnum.Results, element: <PredictionResults /> },
                    { path: RouteProxyEnum.Efficiency, element: <PredictionEfficiencyResults /> }
                ]
            },
            {
                path: getRouteOptimization(),
                element: <OptimizationPage />,
                children: [
                    { path: RouteProxyEnum.Preparation, index: true, element: <OptimizationPreparationStage /> },
                    { path: RouteProxyEnum.Calculation, element: <OptimizationCalculation /> },
                    { path: RouteProxyEnum.Results, element: <OptimizationResults /> },
                    { path: RouteProxyEnum.Efficiency, element: <OptimizationEfficiencyResults /> }
                ]
            },
            {
                path: getRouteAccount(),
                element: <AccountPage />
            }
        ]
    },
    {
        path: getRouteLogin(),
        element: <LoginPage />
    },
    {
        path: getRouteRegistration(),
        element: <RegistrationPage />
    },
    {
        path: getRouteForbidden(),
        element: <ForbiddenPage />
    },
    {
        path: '*',
        element: <PageNotFound />
    }
];
