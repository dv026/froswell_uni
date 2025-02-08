import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { always, equals, ifElse } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { RouteEnum } from '../../common/enums/routeEnum';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ButtonTabs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const isCurrent = (stepRoute: string): boolean => {
        return equals(location.pathname, stepRoute);
    };

    return (
        <ButtonGroup spacing='8' variant='tabUnderline'>
            <Button isActive={isCurrent(RouteEnum.Upload)} onClick={() => navigate(RouteEnum.Upload)}>
                {t(dict.load.tabs.data)}
            </Button>
            <Button isActive={isCurrent(RouteEnum.UploadDataWell)} onClick={() => navigate(RouteEnum.UploadDataWell)}>
                {t(dict.load.tabs.wells)}
            </Button>
            <Button isActive={isCurrent(RouteEnum.UploadDataPlast)} onClick={() => navigate(RouteEnum.UploadDataPlast)}>
                {t(dict.load.tabs.plasts)}
            </Button>
            <Button isActive={isCurrent(RouteEnum.UploadBrand)} onClick={() => navigate(RouteEnum.UploadBrand)}>
                {t(dict.load.tabs.tools)}
            </Button>
        </ButtonGroup>
    );
};
