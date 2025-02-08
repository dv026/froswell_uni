import React from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { isNullOrEmpty, shallow } from 'common/helpers/ramda';
import {
    activeContourIdState,
    activeContourSelector,
    intialActiveContourState
} from 'geologicalModel/store/activeContour';
import {
    changingPolygonState,
    contourEditModeState,
    selectedPolygonState,
    togglePolygonState
} from 'geologicalModel/store/contourEditMode';
import inside from 'point-in-polygon';
import { filter, map, reduce } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { RemoveIcon } from '../../common/components/customIcon/general';
import { ContourIcon, ContourOptionalIcon } from '../../common/components/customIcon/map';
import { cls } from '../../common/helpers/styles';
import { CreateContourModal } from './modal/createContourModal';
import { RemoveContourModal } from './modal/removeContourModal';
import { UpdateContourModal } from './modal/updateContourModal';

import css from '../../common/components/mapCanvas/map.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const intialActiveContour = useRecoilValue(intialActiveContourState);

    const [selectedPolygon, setSelectedPolygon] = useRecoilState(selectedPolygonState);
    const [activeContourId, setActiveContourId] = useRecoilState(activeContourIdState);
    const [contourEditMode, setContourEditMode] = useRecoilState(contourEditModeState);
    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);
    const [changingPolygon, setChangingPolygon] = useRecoilState(changingPolygonState);
    const [activeContour, setActiveContour] = useRecoilState(activeContourSelector);

    const onCloseEditMode = () => {
        setContourEditMode(false);
        setTogglePolygon(false);
        setSelectedPolygon([]);
        setActiveContourId(null);
        setChangingPolygon(false);
        setActiveContour(null);
    };

    const removeSelectedPoints = () => {
        if (isNullOrEmpty(selectedPolygon)) {
            return;
        }

        setActiveContour(
            shallow(activeContour, {
                points: filter(
                    it =>
                        !inside(
                            it,
                            map(n => [n.x, n.y], selectedPolygon)
                        ),
                    activeContour.points
                )
            })
        );

        setTogglePolygon(false);
        setSelectedPolygon([]);
    };

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    {contourEditMode ? (
                        <>
                            {activeContourId ? (
                                <>
                                    <Button
                                        leftIcon={<ContourIcon boxSize={7} />}
                                        variant={changingPolygon ? 'callWindowActive' : 'callWindow'}
                                        onClick={() => setChangingPolygon(!changingPolygon)}
                                    >
                                        {t(dict.common.edit)}
                                    </Button>
                                    {intialActiveContour && <UpdateContourModal />}
                                    {isNullOrEmpty(selectedPolygon) ? null : (
                                        <Button leftIcon={<RemoveIcon boxSize={7} />} onClick={removeSelectedPoints}>
                                            {t(dict.common.remove)}
                                        </Button>
                                    )}
                                    {!changingPolygon && <RemoveContourModal />}
                                </>
                            ) : isNullOrEmpty(selectedPolygon) ? (
                                <Button
                                    leftIcon={<ContourIcon boxSize={7} />}
                                    variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                                    onClick={() => setTogglePolygon(!togglePolygon)}
                                >
                                    {t(dict.geoModel.contours.addContour)}
                                </Button>
                            ) : (
                                <CreateContourModal />
                            )}
                        </>
                    ) : (
                        <Button
                            leftIcon={<ContourOptionalIcon boxSize={7} />}
                            onClick={() => setContourEditMode(!togglePolygon)}
                        >
                            {t(dict.geoModel.contours.editingMode)}
                        </Button>
                    )}

                    {contourEditMode && (
                        <Button onClick={onCloseEditMode} px='4px'>
                            <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
                        </Button>
                    )}
                </ButtonGroup>
            </div>
        </div>
    );
};
