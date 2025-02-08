import React, { FC } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { Card } from '../../../../../calculation/components/wellGroup';
import { ButtonsLarge } from '../../../../../calculation/components/wellGroup/buttonsLarge';
import { optimizationWellsState } from '../../store/optimizationWells';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LaunchLargeGroupModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [wells, setWells] = useRecoilState(optimizationWellsState);

    return (
        <>
            <Button variant='link' onClick={onOpen}>
                {t(dict.optimization.details)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalBody>
                        <Card
                            key='large'
                            size='large'
                            buttonGroup={ButtonsLarge}
                            onClose={onClose}
                            wells={wells}
                            setWells={setWells}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
