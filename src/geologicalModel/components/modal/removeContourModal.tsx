import React, { useRef } from 'react';

import {
    Button,
    ButtonGroup,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from '@chakra-ui/react';
import { RemoveIcon } from 'common/components/customIcon/general';
import { activeContourIdState } from 'geologicalModel/store/activeContour';
import { selectedPolygonState, togglePolygonState } from 'geologicalModel/store/contourEditMode';
import { mapSettingsState } from 'geologicalModel/store/mapSettings';
import { currentPlastId } from 'geologicalModel/store/plast';
import { currentSpot } from 'geologicalModel/store/well';
import { InputMapContourModel } from 'input/entities/inputMapContourModel';
import { mapContourRemove } from 'input/gateways';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useResetRecoilState } from 'recoil';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const RemoveContourModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const well = useRecoilValue(currentSpot);
    const plastId = useRecoilValue(currentPlastId);
    const activeContourId = useRecoilValue(activeContourIdState);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);

    const resetTogglePolygon = useResetRecoilState(togglePolygonState);
    const resetSelectedPolygon = useResetRecoilState(selectedPolygonState);
    const resetActiveContourId = useResetRecoilState(activeContourIdState);

    const initialRef = useRef();
    const finalRef = useRef();

    const submit = async () => {
        await mapContourRemove({
            productionObjectId: well.prodObjId,
            plastId: plastId,
            contourId: activeContourId
        } as InputMapContourModel);

        onClose();

        refreshMapSettings();

        resetTogglePolygon();
        resetSelectedPolygon();
        resetActiveContourId();
    };

    return (
        <>
            <Button leftIcon={<RemoveIcon boxSize={7} />} onClick={onOpen}>
                {t(dict.geoModel.contours.deleteSelected)}
            </Button>

            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader> {t(dict.geoModel.contours.deleteSelected)}</ModalHeader>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {t(dict.common.remove)}
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
