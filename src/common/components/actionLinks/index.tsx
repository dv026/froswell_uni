import React from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { equals } from 'ramda';
import { useNavigate, useLocation } from 'react-router-dom';

import * as router from '../../../common/helpers/routers/router';
import { RouteEnum } from '../../enums/routeEnum';
import { isFn, isNullOrEmpty, mapIndexed } from '../../helpers/ramda';
import { makeWellFromSearch } from '../../helpers/routers/query';

import css from './index.module.less';

export interface LinkProps {
    name: string;
    route: RouteEnum;
    emptyParams?: boolean;
    disabled?: boolean;
    group?: boolean;
    onClick?: () => void;
}

interface Props {
    moduleName: string;
    links: LinkProps[];
    groupLinks?: LinkProps[];

    /**
     * Опциональная функция, определяющая является ли кнопка выделенной
     * @param route
     */
    isCurrent?: (stepRoute: string) => boolean;
}

export const ActionLinks = (p: Props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isCurrent = p.isCurrent
        ? p.isCurrent
        : (stepRoute: string): boolean => {
              return equals(location.pathname, stepRoute);
          };

    return (
        <div className={css.actionLinks}>
            <div className={css.actionLinks__title}>{p.moduleName}</div>
            <div className={css.actionLinks__item}>
                {!isNullOrEmpty(p.links) && (
                    <ButtonGroup variant='bookmark' spacing='3'>
                        {mapIndexed(
                            (it: LinkProps, index) => (
                                <Button
                                    key={index}
                                    isActive={isCurrent(it.route)}
                                    isDisabled={it.disabled}
                                    onClick={() => {
                                        navigate(
                                            router.to(
                                                it.route,
                                                it.emptyParams ? null : makeWellFromSearch(location.search)
                                            )
                                        );
                                        isFn(it.onClick) && it.onClick();
                                    }}
                                >
                                    {it.name}
                                </Button>
                            ),
                            p.links
                        )}
                    </ButtonGroup>
                )}
                {!isNullOrEmpty(p.groupLinks) && (
                    <ButtonGroup className={css.groupLinks} variant='bookmark' spacing='3'>
                        {mapIndexed(
                            (it: LinkProps, index) => (
                                <Button
                                    key={index}
                                    isActive={isCurrent(it.route)}
                                    isDisabled={it.disabled}
                                    onClick={() => {
                                        navigate(
                                            router.to(
                                                it.route,
                                                it.emptyParams ? null : makeWellFromSearch(location.search)
                                            )
                                        );
                                        isFn(it.onClick) && it.onClick();
                                    }}
                                >
                                    {it.name}
                                </Button>
                            ),
                            p.groupLinks
                        )}
                    </ButtonGroup>
                )}
            </div>
        </div>
    );
};
