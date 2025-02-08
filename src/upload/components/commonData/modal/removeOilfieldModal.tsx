import React from 'react';

import {
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    ButtonGroup
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE } from 'recoil';

import { DeleteDataIcon } from '../../../../common/components/customIcon/actions';
import { KeyValue } from '../../../../common/entities/keyValue';
import { oilFieldsSelector } from '../../../store/oilFields';
import { useUploadMutations } from '../../../store/uploadMutations';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface ModalProps {
    selected: KeyValue;
}

export const RemoveOilfieldModal: React.FC<ModalProps> = (p: ModalProps) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const refreshOilFields = useRecoilRefresher_UNSTABLE(oilFieldsSelector);

    const upload = useUploadMutations();

    const submit = () => {
        upload.deleteOilField(p.selected.id);

        refreshOilFields();

        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} leftIcon={<DeleteDataIcon boxSize={5} color={'icons.red'} />} variant='unstyled'>
                {t(dict.load.removeOilfield)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.load.warning)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{t('load.removeOilfieldParam', { value: p.selected.name })}</ModalBody>
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
