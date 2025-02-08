import React, { FC, useState } from 'react';

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
import { useRecoilValue } from 'recoil';

import { EditIcon } from '../../../../common/components/customIcon/general';
import { PhysicalProperties } from '../../../entities/physicalProperties';
import { oilFieldPropertiesSelector } from '../../../store/oilFieldProperties';
import { useUploadMutations } from '../../../store/uploadMutations';
import { UpdatePhysicalProperties, UpdatePhysicalPropertiesProps } from '../../updatePhysicalProperties';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const LoadPhysicalModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { t } = useTranslation();

    const oilFieldProperties = useRecoilValue(oilFieldPropertiesSelector);

    const [model, setModel] = useState<PhysicalProperties>();
    const [isChanged, setIsChanged] = useState<boolean>(false);

    const upload = useUploadMutations();

    const physicalPropertiesProps: UpdatePhysicalPropertiesProps = {
        data: oilFieldProperties.physicalProperties,
        plasts: oilFieldProperties.plasts,
        onChange: (model: PhysicalProperties) => {
            setModel(model);
            setIsChanged(true);
        }
    };

    const submit = () => {
        upload.physicalProperties(model);

        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} variant='link' fontSize='12px'>
                <EditIcon color='icons.grey' boxSize={6} />
                {t(dict.common.edit)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.load.physicalProperties)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <UpdatePhysicalProperties {...physicalPropertiesProps} />
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit} isDisabled={!isChanged}>
                                {t(dict.load.saveChanges)}
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
