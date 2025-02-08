import React, { FC, memo, ReactElement } from 'react';

import { Spacer } from '@chakra-ui/react';
import i18n from 'i18next';
import { always, cond, equals, includes, pipe, split, T } from 'ramda';
import { useLocation, useNavigate } from 'react-router-dom';

import { isLogged } from '../../../identity/helpers/authHelper';
import { WellBrief } from '../../entities/wellBrief';
import { RouteEnum } from '../../enums/routeEnum';
import { findOrDefault } from '../../helpers/ramda';
import * as predictionRouter from '../../helpers/routers/predictionRouter';
import * as proxyRouter from '../../helpers/routers/proxyRouter';
import { makeWellFromSearch } from '../../helpers/routers/query';
import * as router from '../../helpers/routers/router';
import { trimPathName } from '../../helpers/serverPath';
import { cls } from '../../helpers/styles';
import { DataIcon, DataPreparationIcon, OptimizeIcon, PredictionIcon, ProxyIcon } from '../customIcon/navigation';
import { Logo } from '../logo';
import { CurrentDb } from './currentDb';
import { InProgress } from './inProgress';
import { UserInfo } from './userInfo';

import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

class Step {
    public enabled: boolean;
    public id: number;
    public name: string;
    public route: RouteEnum;
    public icon: ReactElement;

    public constructor(id: number, name: string, route: RouteEnum, icon: ReactElement, enabled = false) {
        this.enabled = enabled;
        this.id = id;
        this.name = name;
        this.route = route;
        this.icon = icon;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StairwayProps = any;

const myDataStep = new Step(1, i18n.t(dict.stairway.myData), RouteEnum.Input, <DataIcon />, true);
const preparationStep = new Step(
    2,
    i18n.t(dict.stairway.preparation),
    RouteEnum.GeologicalModel,
    <DataPreparationIcon />,
    true
);
const proxyStep = new Step(4, i18n.t(dict.stairway.proxy), RouteEnum.ProxyPreparation, <ProxyIcon />, true);

// const effectiveStep = new Step(
//     5,
//     i18n.t(dict.stairway.efficiency),
//     RouteEnum.EfficiencyResults,
//     <EffectiveIcon />,
//     true
// );

const predictionStep = new Step(
    6,
    i18n.t(dict.stairway.prediction),
    RouteEnum.PredictionPreparation,
    <PredictionIcon />,
    true
);

const optimizeStep = new Step(
    7,
    i18n.t(dict.stairway.optimization),
    RouteEnum.OptimizationPreparation,
    <OptimizeIcon />,
    true
);

/**
 * Возвращает строковое представление названия текущего модуля из url
 * @param url   Строка url
 */
const getModuleName = (url: string) =>
    pipe(trimPathName, split('/'), x => findOrDefault(always(true), x => x, '', x))(url || '');

const splitBySlash = split('/');
const isRouteOfModule = (module: RouteEnum) => (route: RouteEnum) => splitBySlash(module)[1] === splitBySlash(route)[1];

const getRouter = (route: RouteEnum) =>
    cond([
        [isRouteOfModule(RouteEnum.Proxy), always(proxyRouter)],
        [isRouteOfModule(RouteEnum.Efficiency), always(predictionRouter)],
        [isRouteOfModule(RouteEnum.Prediction), always(predictionRouter)],
        [isRouteOfModule(RouteEnum.Optimization), always(predictionRouter)],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [T, always(router)]
    ])(route);

export const Stairway: StairwayProps = memo(() => {
    const navigate = useNavigate();
    const location = useLocation();

    const moduleName = getModuleName(location.pathname) as RouteEnum;

    const currentWell = makeWellFromSearch(location.search);

    const makeStep = (step: Step, well: WellBrief, fromModule?: RouteEnum): JSX.Element => {
        const props = {
            className: makeStepClass(step),
            key: step.id,
            onClick: step.enabled
                ? () => {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      navigate(getRouter(step.route).to(step.route, well, fromModule));
                  }
                : null
        };

        return (
            <div {...props}>
                {React.cloneElement(step.icon, { boxSize: 9 })}
                <span>{step.name}</span>
            </div>
        );
    };

    const makeStepClass = (step: Step): string => {
        return cls(
            css.stairway__step,
            !step.enabled && css.stairway__step_disabled,
            isCurrent(step.route) && css.stairway__step_selected
        );
    };

    const isCurrent = (stepRoute: string): boolean => {
        const path = location.pathname;

        if (
            equals(getModuleName(path), getModuleName(stepRoute)) ||
            (includes(getModuleName(path), [
                getModuleName(RouteEnum.Upload),
                getModuleName(RouteEnum.Input),
                getModuleName(RouteEnum.InputEfficiency)
            ]) &&
                stepRoute === RouteEnum.Input)
        ) {
            return true;
        }

        if (
            includes(getModuleName(path), [
                getModuleName(RouteEnum.GeologicalModel),
                getModuleName(RouteEnum.Filtration)
            ]) &&
            stepRoute === RouteEnum.GeologicalModel
        ) {
            return true;
        }

        return false;
    };

    return isLogged() ? (
        <div className={css.stairway}>
            <Logo />
            <div>
                {makeStep(myDataStep, currentWell, moduleName)}
                {makeStep(preparationStep, currentWell, moduleName)}
            </div>
            <div className={css.stairway__links}>
                <div className={css.stairway__proxy}>
                    {makeStep(proxyStep, currentWell, moduleName)}
                    <div className={css.stairway__delimiter} />
                    {/* {makeStep(effectiveStep, currentWell, moduleName)} */}
                    {makeStep(predictionStep, currentWell, moduleName)}
                    {makeStep(optimizeStep, currentWell, moduleName)}
                </div>
            </div>
            <InProgress />
            <Spacer />
            <UserInfo />
            <CurrentDb />
        </div>
    ) : null;
});
