import React, { FC } from 'react';

import {
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    ButtonGroup
} from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilValue } from 'recoil';

import { currentScenarioItem } from '../../../../../calculation/store/currentScenarioId';
import { CopyIcon } from '../../../../../common/components/customIcon/actions';
import { useScenarioMutations } from '../../store/scenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const CopyScenarioModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const item = useRecoilValue(currentScenarioItem);

    const dispatcher = useScenarioMutations();

    const submit = (withResult: boolean = false) => {
        dispatcher.copyItem(item.id, withResult);
        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} leftIcon={<CopyIcon boxSize={4} />} variant='unstyled'>
                {i18n.t(dict.common.copy)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.proxy.scenarios.copy)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={() => submit(false)}>
                                {i18n.t(dict.common.copy)}
                            </Button>
                            {item.calcState ? (
                                <Button variant='cancel' onClick={() => submit(true)}>
                                    {`${i18n.t(dict.common.copy)} ${i18n.t(dict.common.copyWithResults)}`}
                                </Button>
                            ) : null}
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
