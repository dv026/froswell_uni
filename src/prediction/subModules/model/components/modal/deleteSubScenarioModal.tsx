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
import i18n from 'i18next';

import { DeleteIcon } from '../../../../../common/components/customIcon/actions';
import { useSubScenarioMutations } from '../../store/subScenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const DeleteSubScenarioModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const dispatcher = useSubScenarioMutations();

    const submit = () => {
        dispatcher.deleteItem();
        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} leftIcon={<DeleteIcon boxSize={4} color={'icons.red'} />} variant='unstyled'>
                {i18n.t(dict.common.remove)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.load.warning)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{i18n.t(dict.proxy.subscenarios.deleteCurrent)}</ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {i18n.t(dict.common.remove)}
                            </Button>
                            <Button onClick={onClose} variant='cancel'>
                                {i18n.t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
