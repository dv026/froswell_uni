import React from 'react';
import { FC } from 'react';

import { ButtonGroup, Skeleton } from '@chakra-ui/react';

import css from './../actionLinks/index.module.less';

export const SkeletonActionLinks = () => {
    return (
        <div className={css.actionLinks}>
            <Skeleton>
                <div className={css.actionLinks__title}>Прокси-модель</div>
            </Skeleton>
            <div className={css.actionLinks__item}>
                <ButtonGroup variant='bookmark' spacing='3'>
                    <Skeleton />
                    <Skeleton />
                </ButtonGroup>
            </div>
        </div>
    );
};
