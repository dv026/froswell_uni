import React, { FC, memo } from 'react';

import { cls } from 'common/helpers/styles';
import { useNavigate } from 'react-router-dom';

import { RouteEnum } from '../../enums/routeEnum';

import css from './index.module.less';

export const Logo: FC = memo(() => {
    const navigate = useNavigate();

    return (
        <div className={css.logo} onClick={() => navigate(RouteEnum.Input)}>
            <div className={cls([css.logo__emblem])}>
                <img alt='' src='/images/logo.png' />
            </div>
        </div>
    );
});
