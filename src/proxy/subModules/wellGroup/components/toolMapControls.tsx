import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { includes, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { isLoadingWellGroupState } from '../../../../calculation/store/isLoadingWellGroup';
import { selectedPolygonState, togglePolygonState } from '../../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../../calculation/store/selectedAdditionalWell';
import { selectedWellsState } from '../../../../calculation/store/selectedWells';
import { AddIcon, RemoveIcon } from '../../../../common/components/customIcon/general';
import { ContourIcon } from '../../../../common/components/customIcon/map';
import { SearchTool } from '../../../../common/components/mapCanvas/searchTool';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';
import { adaptationWellGroupState } from '../store/adaptationWellGroup';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const isLoading = useRecoilValue(isLoadingWellGroupState);
    const selectedWells = useRecoilValue(selectedWellsState);

    const [wellGroup, setWellGroup] = useRecoilState(adaptationWellGroupState);
    const [selectedPolygon, setSelectedPolygon] = useRecoilState(selectedPolygonState);
    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);

    const selectedAdditionalWell = useSetRecoilState(selectedAdditionalWellState);

    const selectWellGroup = useRecoilCallback(() => async () => {
        const filtered = map(x => x.id, selectedWells);

        setSelectedPolygon([]);
        setTogglePolygon(false);

        setWellGroup(
            map(
                it => ({
                    id: it.id,
                    name: it.name,
                    type: it.type,
                    license: it.license,
                    selected: includes(it.id, filtered)
                }),
                wellGroup
            )
        );
    });

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <SearchTool onSearch={selectedAdditionalWell} />
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    {isNullOrEmpty(selectedPolygon) ? (
                        <Button
                            leftIcon={<ContourIcon boxSize={7} />}
                            variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                            onClick={() => setTogglePolygon(!togglePolygon)}
                        >
                            {t(dict.map.selectWellsGroup)}
                        </Button>
                    ) : (
                        <Button
                            isLoading={isLoading}
                            leftIcon={<AddIcon boxSize={6} color='icons.green' />}
                            variant={'callWindow'}
                            onClick={selectWellGroup}
                        >
                            {t(dict.common.confirm)}
                        </Button>
                    )}
                    {togglePolygon ? (
                        <Button onClick={() => setTogglePolygon(false)} px='4px'>
                            <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
                        </Button>
                    ) : null}
                </ButtonGroup>
            </div>

            <ReactTooltip className={css.map__toolTooltip} effect='solid' />
        </div>
    );
};
