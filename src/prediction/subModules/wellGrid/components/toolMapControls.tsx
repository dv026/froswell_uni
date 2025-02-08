import React, { FC, useEffect, useState } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { CopyCharworksModal } from '../../../../calculation/components/modal/copyCharworksModal';
import { selectedPolygonState, togglePolygonState } from '../../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../../calculation/store/selectedAdditionalWell';
import { RemoveIcon } from '../../../../common/components/customIcon/general';
import { ContourIcon } from '../../../../common/components/customIcon/map';
import { SearchTool } from '../../../../common/components/mapCanvas/searchTool';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const [selectedPolygon, setSelectedPolygon] = useRecoilState(selectedPolygonState);
    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);

    const selectedAdditionalWell = useSetRecoilState(selectedAdditionalWellState);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isNullOrEmpty(selectedPolygon) && togglePolygon) {
            setIsOpen(true);
        }
    }, [selectedPolygon, togglePolygon]);

    const onClose = () => {
        setIsOpen(false);
        setSelectedPolygon([]);
        setTogglePolygon(false);
    };

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <SearchTool onSearch={selectedAdditionalWell} />
                <CopyCharworksModal isOpen={isOpen} onClose={onClose} />
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    {isNullOrEmpty(selectedPolygon) ? (
                        <>
                            <Button
                                leftIcon={<ContourIcon boxSize={7} />}
                                variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                                onClick={() => {
                                    setTogglePolygon(!togglePolygon);
                                }}
                            >
                                {t(dict.calculation.map.copyWellTypes)}
                            </Button>
                        </>
                    ) : null}
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
