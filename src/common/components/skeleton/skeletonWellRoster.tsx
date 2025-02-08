import React from 'react';
import { FC } from 'react';

import { Skeleton, Stack } from '@chakra-ui/react';

import { trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { MenuIcon } from '../customIcon/general';
import { SearchField } from '../wellRoster/searchField';

import css from './../wellRoster/wellRoster.module.less';

export const SkeletonWellRoster = () => {
    return (
        <>
            <div className={cls(css.roster, trueOrNull(false, css.roster_collapsed))}>
                <div className={css.roster__header}>
                    <div className={css.roster__title}>
                        <Skeleton w='250px' h='24px' />
                    </div>

                    <div className={css.roster__search}>
                        <SearchField text={null} onChange={null} />
                    </div>
                </div>
                <div className={css.roster__list}>
                    <Skeleton ml={3} height='36px' />
                    <Stack mt={2} ml={3} pl={8}>
                        <Skeleton height='36px' />
                        <Skeleton height='36px' />
                        <Skeleton height='36px' />
                    </Stack>
                    <Skeleton mt={2} ml={3} height='36px' />
                    <Stack mt={2} ml={3} pl={8}>
                        <Skeleton height='36px' />
                    </Stack>
                    <Skeleton mt={2} ml={3} height='36px' />
                    <Stack mt={2} ml={3} pl={8}>
                        <Skeleton height='36px' />
                        <Skeleton height='36px' />
                    </Stack>
                </div>
                <div className={cls(css.latch)} onClick={null}>
                    <MenuIcon color='icons.grey' boxSize={7} />
                </div>
            </div>
        </>
    );
};
