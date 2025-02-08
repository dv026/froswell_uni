import React from 'react';
import { FC } from 'react';

import i18n from 'i18next';
import { useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { SubModuleType } from '../../../../../calculation/enums/subModuleType';
import { ActionLinks as BaseActionLinks, LinkProps } from '../../../../../common/components/actionLinks';
import { RouteEnum } from '../../../../../common/enums/routeEnum';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { submoduleState } from '../../../../store/submodule';
import { wellListForResults } from '../../../../store/wellList';

import mainDict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const ActionLinks = () => {
    const listLoadable = useRecoilValueLoadable(wellListForResults);

    const setSubmodule = useSetRecoilState(submoduleState);

    const modules: LinkProps[] = [
        {
            name: i18n.t(mainDict.common.calc),
            route: RouteEnum.PredictionPreparation,
            onClick: () => setSubmodule(SubModuleType.Calculation)
        }
    ];

    const groupModules: LinkProps[] = [
        {
            name: i18n.t(mainDict.proxy.results),
            route: RouteEnum.PredictionResults,
            disabled: hasValue(listLoadable) ? isNullOrEmpty(listLoadable.contents) : false,
            onClick: () => setSubmodule(SubModuleType.Results)
        },
        {
            name: i18n.t(mainDict.stairway.gtmEfficiency),
            route: RouteEnum.PredictionEfficiency,
            disabled: false,
            onClick: () => setSubmodule(SubModuleType.Efficiency)
        }
    ];

    return (
        <BaseActionLinks moduleName={i18n.t(mainDict.stairway.prediction)} links={modules} groupLinks={groupModules} />
    );
};
