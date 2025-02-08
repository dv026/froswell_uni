import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { isLoadingWellGroupState } from '../../../../calculation/store/isLoadingWellGroup';
import { selectedPolygonState, togglePolygonState } from '../../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../../calculation/store/selectedAdditionalWell';
import { AddIcon, RemoveIcon } from '../../../../common/components/customIcon/general';
import { ContourIcon } from '../../../../common/components/customIcon/map';
import { SearchTool } from '../../../../common/components/mapCanvas/searchTool';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';
import { mapSettingsState } from '../../../store/map/mapSettings';
import { useProxyMapMutations } from '../../../store/map/proxyMapMutations';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const isLoading = useRecoilValue(isLoadingWellGroupState);
    const selectedPolygon = useRecoilValue(selectedPolygonState);
    const mapSettings = useRecoilValue(mapSettingsState);

    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);

    const selectedAdditionalWell = useSetRecoilState(selectedAdditionalWellState);

    const dispatcher = useProxyMapMutations();

    const toogle = (value: boolean) => {
        setTogglePolygon(value);
    };

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <SearchTool onSearch={selectedAdditionalWell} />
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    {!isLoading ? (
                        <>
                            {isNullOrEmpty(selectedPolygon) ? (
                                <Button
                                    leftIcon={<ContourIcon boxSize={6} />}
                                    variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                                    onClick={() => toogle(!togglePolygon)}
                                >
                                    {t(dict.proxy.wellGrid.drawAdaptationContour)}
                                </Button>
                            ) : (
                                <Button
                                    leftIcon={<AddIcon boxSize={6} color='icons.green' />}
                                    variant={'callWindow'}
                                    onClick={() => dispatcher.addWellGroup([])}
                                >
                                    {t(dict.proxy.wellGrid.addCalculationGroup)}
                                </Button>
                            )}
                            {togglePolygon ? (
                                <Button onClick={() => toogle(false)} px='4px'>
                                    <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
                                </Button>
                            ) : null}
                        </>
                    ) : null}
                    {!togglePolygon && !isNullOrEmpty(mapSettings.wellGroup) ? (
                        <Button
                            isLoading={isLoading}
                            variant={'callWindow'}
                            leftIcon={<RemoveIcon boxSize={7} color='icons.red' />}
                            onClick={() => dispatcher.removeWellGroup()}
                        >
                            {t(dict.proxy.wellGrid.removeAdaptationContour)}
                        </Button>
                    ) : null}
                </ButtonGroup>
            </div>

            <ReactTooltip className={css.map__toolTooltip} effect='solid' />
        </div>
    );
};
