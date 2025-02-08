import React, { FC, useEffect, useState } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { selectedPolygonState, togglePolygonState } from '../../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../../calculation/store/selectedAdditionalWell';
import { RemoveIcon } from '../../../../common/components/customIcon/general';
import { ContourIcon, ContourOptionalIcon } from '../../../../common/components/customIcon/map';
import { SearchTool } from '../../../../common/components/mapCanvas/searchTool';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';
import { CopyAreaModal } from './modal/copyAreaModal';
import { EditPropertiesModal } from './modal/editPropertiesModal';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

enum ModalType {
    Properties,
    CopyArea
}

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const [selectedPolygon, setSelectedPolygon] = useRecoilState(selectedPolygonState);
    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);

    const selectedAdditionalWell = useSetRecoilState(selectedAdditionalWellState);

    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState(ModalType.Properties);

    const isProperties = modalType === ModalType.Properties;
    const isCopyArea = modalType === ModalType.CopyArea;

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
                {modalType === ModalType.Properties ? (
                    <EditPropertiesModal isOpen={isOpen} onClose={onClose} />
                ) : (
                    <CopyAreaModal isOpen={isOpen} onClose={onClose} />
                )}
                <SearchTool onSearch={selectedAdditionalWell} />
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    {isNullOrEmpty(selectedPolygon) ? (
                        <>
                            <Button
                                leftIcon={<ContourIcon boxSize={7} />}
                                variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                                hidden={togglePolygon && !isProperties}
                                onClick={() => {
                                    setModalType(ModalType.Properties);
                                    setTogglePolygon(!togglePolygon);
                                }}
                            >
                                {t(dict.calculation.map.editProperties)}
                            </Button>
                            <Button
                                leftIcon={<ContourOptionalIcon boxSize={7} />}
                                variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                                hidden={togglePolygon && !isCopyArea}
                                onClick={() => {
                                    setModalType(ModalType.CopyArea);
                                    setTogglePolygon(!togglePolygon);
                                }}
                            >
                                {t(dict.calculation.map.copyPropertiesFromAnotherModel)}
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
