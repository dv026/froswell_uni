import React from 'react';

import {
    Button,
    ButtonGroup,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text,
    useDisclosure
} from '@chakra-ui/react';
import i18n from 'i18next';
import { useRecoilValue } from 'recoil';

import { currentScenarioItem } from '../../../../../calculation/store/currentScenarioId';
import { currentSubScenarioItem } from '../../../../../calculation/store/currentSubScenarioId';
import { useInsimMutations } from '../../../../../calculation/store/insimMutations';
import { NextIcon } from '../../../../../common/components/customIcon/general';
import { FormField } from '../../../../../common/components/formField';
import { DirectedStageEnum } from '../../../../enums/directedStageEnum';
import { currentStepState } from '../../../../store/currentStep';
import { OptimizationParameters } from '../../../preparation/components/optimizationParameters';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LaunchCalculationModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const scenarioItem = useRecoilValue(currentScenarioItem);
    const subScenarioItem = useRecoilValue(currentSubScenarioItem);

    const dispatcher = useInsimMutations();

    const handleOpenClick = () => {
        onOpen();
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        dispatcher.startOptimization();

        onClose();
    };

    return (
        <>
            <Button
                rightIcon={<NextIcon boxSize={6} />}
                variant='nextStage'
                isDisabled={false}
                onClick={handleOpenClick}
            >
                {i18n.t(dict.common.calc)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='2xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.optimization.calcStart)}</ModalHeader>
                    <ModalBody>
                        <FormField title={i18n.t(dict.common.scenario)}>
                            <Text>{scenarioItem.name}</Text>
                        </FormField>
                        <FormField title={i18n.t(dict.common.subScenario)}>
                            <Text>{subScenarioItem.name}</Text>
                        </FormField>
                        <OptimizationParameters />
                    </ModalBody>
                    <ModalFooter>
                        <Spacer />
                        <ButtonGroup>
                            <Button variant='primary' onClick={handleSubmit}>
                                {i18n.t(dict.calculation.title)}
                            </Button>
                            <Button onClick={handleClose} variant='cancel'>
                                {i18n.t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
