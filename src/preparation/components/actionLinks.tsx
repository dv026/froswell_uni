import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { ActionLinks as BaseActionLinks } from '../../common/components/actionLinks';
import { RouteEnum } from '../../common/enums/routeEnum';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ActionLinks = () => {
    const { t } = useTranslation();

    const modules = [
        {
            name: t(dict.preparation.geoModel),
            route: RouteEnum.GeologicalModel
        },
        {
            name: t(dict.preparation.filtration),
            route: RouteEnum.Filtration
        }
    ];

    return <BaseActionLinks moduleName={t(dict.preparation.moduleName)} links={modules} />;
};
