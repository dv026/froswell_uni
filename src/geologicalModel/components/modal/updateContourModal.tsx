import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Checkbox,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from '@chakra-ui/react';
import { AddIcon } from 'common/components/customIcon/general';
import { Dropdown, DropdownOption } from 'common/components/dropdown/dropdown';
import { InputNumber } from 'common/components/inputNumber';
import { Point } from 'common/entities/canvas/point';
import { myInterpolate } from 'common/helpers/d3helper';
import { round0 } from 'common/helpers/math';
import { isNullOrEmpty } from 'common/helpers/ramda';
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
import { mapSettingsState } from 'geologicalModel/store/mapSettings';
import { currentPlastId } from 'geologicalModel/store/plast';
import { currentSpot } from 'geologicalModel/store/well';
import { InputMapContourModel } from 'input/entities/inputMapContourModel';
import { mapContourAdd, mapContourUpdate } from 'input/gateways';
import { dropLast, equals, head, last, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import { contoursTypes } from './createContourModal';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const UpdateContourModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const well = useRecoilValue(currentSpot);
    const plastId = useRecoilValue(currentPlastId);
    const activeContour = useRecoilValue(activeContourSelector);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);

    const resetTogglePolygon = useResetRecoilState(togglePolygonState);
    const resetSelectedPolygon = useResetRecoilState(selectedPolygonState);
    const resetChangingPolygon = useResetRecoilState(changingPolygonState);
    const resetIntialActiveContour = useResetRecoilState(intialActiveContourState);
    const resetActiveContourId = useResetRecoilState(activeContourIdState);

    const [contourTypeId, setContourTypeId] = useState<number>(activeContour.type);
    const [interpolation, setInterpolation] = useState<number>(1);
    const [isClosed, setIsClosed] = useState<boolean>(true);

    const initialRef = useRef();
    const finalRef = useRef();

    useEffect(() => {
        setContourTypeId(activeContour.type);
        setIsClosed(
            isNullOrEmpty(activeContour.points) ? true : equals(head(activeContour.points), last(activeContour.points))
        );
    }, [activeContour]);

    const submit = async () => {
        let polygon = activeContour.points;

        if (interpolation > 1) {
            polygon = myInterpolate(polygon, interpolation * activeContour.points.length);
        }

        await mapContourUpdate({
            productionObjectId: well.prodObjId,
            plastId: plastId,
            contourTypeId: contourTypeId,
            contourId: activeContour.id,
            polygon: map(it => new Point(round0(it[0]), round0(it[1])), polygon),
            interpolation: interpolation
        } as InputMapContourModel);

        onClose();

        refreshMapSettings();

        resetTogglePolygon();
        resetSelectedPolygon();
        resetChangingPolygon();
        resetIntialActiveContour();
        resetActiveContourId();
    };

    if (!activeContour || isNullOrEmpty(activeContour.points)) {
        return null;
    }

    return (
        <>
            <Button leftIcon={<AddIcon boxSize={7} />} onClick={onOpen}>
                {t(dict.load.saveChanges)}
            </Button>

            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.geoModel.contours.updateContour)}</ModalHeader>
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>{t(dict.geoModel.contours.contourType)}</FormLabel>
                            <Dropdown
                                onChange={e => setContourTypeId(+e.target.value)}
                                options={contoursTypes}
                                value={contourTypeId}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>{t(dict.geoModel.contours.interpolation)}</FormLabel>
                            <InputNumber
                                value={interpolation}
                                min={1}
                                max={100}
                                step={1}
                                onChange={val => setInterpolation(+val)}
                            />
                        </FormControl>
                        <FormControl>
                            <Checkbox isChecked={isClosed} onChange={e => setIsClosed(e.target.checked)}>
                                {t(dict.geoModel.contours.closedLoop)}
                            </Checkbox>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {t(dict.common.save)}
                            </Button>
                            <Button onClick={onClose} variant='cancel'>
                                {t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
