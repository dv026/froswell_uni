import React, { FC, useEffect } from 'react';

import {
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    ButtonGroup
} from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilValue } from 'recoil';

import { currentSubScenarioItem } from '../../../../../calculation/store/currentSubScenarioId';
import { RenameIcon } from '../../../../../common/components/customIcon/actions';
import { useSubScenarioMutations } from '../../store/subScenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const RenameSubScenarioModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const object = useRecoilValue(currentSubScenarioItem);

    const dispatcher = useSubScenarioMutations();

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
                    <ModalHeader>{i18n.t(dict.proxy.subscenarios.editing)}</ModalHeader>
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
