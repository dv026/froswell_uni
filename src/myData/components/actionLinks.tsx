import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { ActionLinks as BaseActionLinks } from '../../common/components/actionLinks';
import { RouteEnum } from '../../common/enums/routeEnum';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ActionLinks = () => {
    const { t } = useTranslation();

    const modules = [
        {
            name: t(dict.myData.uploaded),
            route: RouteEnum.Upload,
            emptyParams: true
        }
    ];

    const groupModules = [
        {
            name: t(dict.myData.input),
            route: RouteEnum.Input
        },
        {
            name: t(dict.stairway.gtmEfficiency),
            route: RouteEnum.InputEfficiency
        }
    ];

    return <BaseActionLinks moduleName={t(dict.myData.moduleName)} links={modules} groupLinks={groupModules} />;
};
