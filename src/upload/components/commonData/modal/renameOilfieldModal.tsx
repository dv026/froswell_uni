import React, { FC, useRef, useState } from 'react';

import {
    Button,
    ButtonGroup,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE } from 'recoil';

import { RenameIcon } from '../../../../common/components/customIcon/actions';
import { KeyValue } from '../../../../common/entities/keyValue';
import { oilFieldsSelector } from '../../../store/oilFields';
import { useUploadMutations } from '../../../store/uploadMutations';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface ModalProps {
    selected: KeyValue;
}

export const RenameOilfieldModal: FC<ModalProps> = (p: ModalProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { t } = useTranslation();

    const refreshOilFields = useRecoilRefresher_UNSTABLE(oilFieldsSelector);

    const upload = useUploadMutations();

    const [name, setName] = useState<string>(p.selected.name);

    const initialRef = useRef();
    const finalRef = useRef();

    const submit = () => {
        upload.renameOilField(p.selected.id, name);

        refreshOilFields();

        onClose();
    };

    return (
        <>
            <Button leftIcon={<RenameIcon boxSize={5} />} variant='unstyled' onClick={onOpen}>
                {t(dict.load.renameOilfield)}
            </Button>

            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.load.renameOilfield)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>{t(dict.load.oilfieldName)}</FormLabel>
                            <Input
                                ref={initialRef}
                                placeholder={t(dict.common.oilfield)}
                                value={name}
                                onChange={v => setName(v.target.value)}
                            />
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
