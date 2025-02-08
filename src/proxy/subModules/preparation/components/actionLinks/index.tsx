import React from 'react';
import { FC } from 'react';

import i18n from 'i18next';
import { useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../../../../../calculation/enums/subModuleType';
import { proxySharedState } from '../../../../../calculation/store/sharedCalculation';
import { ActionLinks as BaseActionLinks, LinkProps } from '../../../../../common/components/actionLinks';
import { RouteEnum } from '../../../../../common/enums/routeEnum';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { submoduleState } from '../../../../store/submodule';
import { wellListForResults } from '../../../../store/wellList';

import mainDict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const ActionLinks = () => {
    const shared = useRecoilValueLoadable(proxySharedState);
    const list = useRecoilValue(wellListForResults);

    const setSubmodule = useSetRecoilState(submoduleState);

    const disableResults = hasValue(shared) ? isNullOrEmpty(shared.contents?.templates) || isNullOrEmpty(list) : true;
    const disableEfficiency = disableResults;

    const modules: LinkProps[] = [
        {
            name: i18n.t(mainDict.proxy.adaptation),
            route: RouteEnum.ProxyPreparation,
            onClick: () => setSubmodule(SubModuleType.Calculation)
        }
    ];

    const groupModules: LinkProps[] = [
        {
            name: i18n.t(mainDict.proxy.results),
            route: RouteEnum.ProxyResults,
            disabled: disableResults,
            onClick: () => setSubmodule(SubModuleType.Results)
        },
        {
            name: i18n.t(mainDict.stairway.gtmEfficiency),
            route: RouteEnum.ProxyEfficiency,
            disabled: disableEfficiency,
            onClick: () => setSubmodule(SubModuleType.Efficiency)
        }
    ];

    return <BaseActionLinks moduleName={i18n.t(mainDict.stairway.proxy)} links={modules} groupLinks={groupModules} />;
};
