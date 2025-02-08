import React, { FC, useEffect } from 'react';

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
    FormControl,
    FormLabel,
    Input,
    ButtonGroup
} from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilValue } from 'recoil';

import { currentScenarioItem } from '../../../../../calculation/store/currentScenarioId';
import { RenameIcon } from '../../../../../common/components/customIcon/actions';
import { useScenarioMutations } from '../../store/scenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const RenameScenarioModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const object = useRecoilValue(currentScenarioItem);

    const dispatcher = useScenarioMutations();

    const [name, setName] = React.useState<string>(object?.name);

    useEffect(() => {
        setName(object?.name);
    }, [object]);

    const submit = () => {
        dispatcher.renameItem(name);
        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} leftIcon={<RenameIcon boxSize={4} />} variant='unstyled'>
                {i18n.t(dict.common.rename)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.proxy.scenarios.editing)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel></FormLabel>
                            <Input
                                placeholder={i18n.t(dict.common.scenario)}
                                value={name}
                                onChange={v => setName(v.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {i18n.t(dict.common.rename)}
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
