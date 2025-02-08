import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { any } from 'ramda';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilValue } from 'recoil';

import { cls } from '../../../../common/helpers/styles';
import { moduleState } from '../store/moduleState';
import { useTargetMutations } from '../store/targetMutations';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ToolControls = () => {
    const { t } = useTranslation();

    const module = useRecoilValue(moduleState);

    const dispatcher = useTargetMutations();

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <ButtonGroup spacing={3} variant={'callWindow'}>
                    <Button onClick={() => dispatcher.create(1)}>{t(dict.optimization.goals.limitOil)}</Button>
                    {any(x => x.type === 2, module.targetZones) ? null : (
                        <Button onClick={() => dispatcher.create(2)}>{t(dict.optimization.goals.limitLiquid)}</Button>
                    )}
                    {any(x => x.type === 3, module.targetZones) ? null : (
                        <Button onClick={() => dispatcher.create(3)}>
                            {t(dict.optimization.goals.limitInjection)}
                        </Button>
                    )}
                </ButtonGroup>
            </div>

            <ReactTooltip className={css.map__toolTooltip} effect='solid' />
        </div>
    );
};
