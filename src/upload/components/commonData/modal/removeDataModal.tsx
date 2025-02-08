import React, { FC } from 'react';

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

import { DeleteIcon } from '../../../../common/components/customIcon/actions';
import { KeyValue } from '../../../../common/entities/keyValue';
import { useUploadMutations } from '../../../store/uploadMutations';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface ModalProps {
    selected: KeyValue;
}

export const RemoveDataModal: FC<ModalProps> = (p: ModalProps) => {
    const { t } = useTranslation();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const upload = useUploadMutations();

    const submit = () => {
        upload.clearAllData(p.selected.id);

        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} leftIcon={<DeleteIcon boxSize={5} color={'icons.red'} />} variant='unstyled'>
                {t(dict.load.removeAllData)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.load.warning)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{t(dict.load.removeAllData)}?</ModalBody>
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
