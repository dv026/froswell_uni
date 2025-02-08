import React, { useRef, useState } from 'react';

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
import { contourEditModeState, selectedPolygonState, togglePolygonState } from 'geologicalModel/store/contourEditMode';
import { mapSettingsState } from 'geologicalModel/store/mapSettings';
import { currentPlastId } from 'geologicalModel/store/plast';
import { currentSpot } from 'geologicalModel/store/well';
import { InputMapContourModel } from 'input/entities/inputMapContourModel';
import { mapContourAdd } from 'input/gateways';
import { dropLast, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const CreateContourModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const well = useRecoilValue(currentSpot);
    const plastId = useRecoilValue(currentPlastId);
    const selectedPolygon = useRecoilValue(selectedPolygonState);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);

    const resetTogglePolygon = useResetRecoilState(togglePolygonState);
    const resetSelectedPolygon = useResetRecoilState(selectedPolygonState);

    const [contourTypeId, setContourTypeId] = useState<number>(1);
    const [interpolation, setInterpolation] = useState<number>(1);
    const [isClosed, setIsClosed] = useState<boolean>(true);

    const initialRef = useRef();
    const finalRef = useRef();

    const submit = async () => {
        let polygon = map(it => [it.x, it.y], isClosed ? selectedPolygon : dropLast(1, selectedPolygon));

        if (interpolation > 1) {
            polygon = myInterpolate(polygon, interpolation * selectedPolygon.length);
        }

        await mapContourAdd({
            productionObjectId: well.prodObjId,
            plastId: plastId,
            contourTypeId: contourTypeId,
            polygon: map(it => new Point(round0(it[0]), round0(it[1])), polygon),
            interpolation: interpolation
        } as InputMapContourModel);

        onClose();

        refreshMapSettings();

        resetTogglePolygon();
        resetSelectedPolygon();
    };

    return (
        <>
            <Button leftIcon={<AddIcon boxSize={7} />} onClick={onOpen}>
                {t(dict.geoModel.contours.createContour)}
            </Button>

            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.geoModel.contours.creatingNewContour)}</ModalHeader>
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

export const contoursTypes = [
    new DropdownOption(0, 'Граница неопределенного типа'),
    new DropdownOption(1, 'Лицензионная граница'),
    new DropdownOption(2, 'Внешний контур нефтеносности внутрь'),
    new DropdownOption(3, 'Внешний контур нефтеносности наружу'),
    new DropdownOption(4, 'Внутренний контур нефтеносности внутрь'),
    new DropdownOption(5, 'Внутренний контур нефтеносности наружу'),
    new DropdownOption(6, 'Замещение коллектора внутрь'),
    new DropdownOption(7, 'Замещение коллектора наружу'),
    new DropdownOption(8, 'Выклинивание коллектора внутрь'),
    new DropdownOption(9, 'Выклинивание коллектора наружу'),
    new DropdownOption(11, 'Внешний контур газоносности внутрь'),
    new DropdownOption(12, 'Внешний контур газоносности наружу')
];
