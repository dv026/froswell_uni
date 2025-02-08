import React, { useEffect } from 'react';

import {
    Accordion,
    Button,
    ButtonGroup,
    HStack,
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
import { EngineSelector } from 'proxy/subModules/preparation/components/engineSelector';
import { map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationModeEnum } from '../../../../../calculation/enums/calculationModeEnum';
import { updPeriod } from '../../../../../calculation/enums/periodEnum';
import { calculationModeState } from '../../../../../calculation/store/calculationMode';
import { currentScenarioId } from '../../../../../calculation/store/currentScenarioId';
import {
    adaptationRatioParam,
    adaptationsNumberParam,
    insimCalcParams
} from '../../../../../calculation/store/insimCalcParams';
import { useInsimMutations } from '../../../../../calculation/store/insimMutations';
import { scenariosState } from '../../../../../calculation/store/scenarios';
import { NextIcon } from '../../../../../common/components/customIcon/general';
import { DatePicker } from '../../../../../common/components/datePicker';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { InputNumber } from '../../../../../common/components/inputNumber';
import {
    CommonSettings,
    GeoModelSettings,
    PermeabilitiesSettings,
    SkinFactorSettings,
    WeightsSettings
} from '../../../../components/settings';
import { DirectedStageEnum } from '../../../../enums/directedStageEnum';
import { currentStep } from '../../../../store/currentStep';
import { saveAdaptationWellGroup } from '../../../wellGroup/gateways/gateway';
import { adaptationWellGroupState } from '../../../wellGroup/store/adaptationWellGroup';
import { calculationPeriod } from '../../store/calculationPeriod';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LaunchAdaptationModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { t } = useTranslation();

    const adaptationWellGroup = useRecoilValue(adaptationWellGroupState);
    const calculationMode = useRecoilValue(calculationModeState);
    const scenarioId = useRecoilValue(currentScenarioId);
    const scenarios = useRecoilValue(scenariosState);

    const period = useRecoilValue(calculationPeriod(scenarioId));

    const [params, setParams] = useRecoilState(insimCalcParams);

    const setStep = useSetRecoilState(currentStep);

    // TODO: если убрать получение состояния из сторов, то аккордион некорректно рендерится (отображается не только
    //  первый айтем, но и второй. Также при скрытии/раскрытии блоков и клике по чекбоксам появляются визуальные проблемы.
    //  Необходимо разобраться в причинах:
    //      - возможно происходят лишние рендеры в Settings компонентах
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [adaptationRatio, setAdaptationRatio] = useRecoilState(adaptationRatioParam);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [adaptations, setAdaptations] = useRecoilState(adaptationsNumberParam);

    const dispatcher = useInsimMutations();

    useEffect(() => {
        if (calculationMode === CalculationModeEnum.Creation) {
            setParams(updPeriod(params, period));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenarioId]);

    const handleOpenClick = () => {
        saveAdaptationWellGroup(adaptationWellGroup, scenarioId);

        onOpen();
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        dispatcher.startAdaptation(calculationMode);

        // setStep(DirectedStageEnum.Calculation);
        onClose();
    };

    const scenarioDropdown: DropdownProps = {
        options: map(it => new DropdownOption(it.id, it.name), scenarios),
        value: scenarioId
    };

    return (
        <>
            <Button
                rightIcon={<NextIcon boxSize={6} />}
                variant='nextStage'
                isDisabled={false}
                onClick={handleOpenClick}
            >
                {t(dict.proxy.adaptation)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='2xl' scrollBehavior='inside'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.proxy.startModal.title)}</ModalHeader>
                    <ModalBody>
                        <FormField title={t(dict.calculation.scenarios.basedOnScenario)} disabled={true}>
                            <Dropdown className='dropdown_well-types' {...scenarioDropdown} />
                            <Info tip={t(dict.calculation.scenarios.basedOnScenario)} />
                        </FormField>
                        {/*<FormField title={t(dict.proxy.ensembleSizeModels)} disabled={true}>*/}
                        {/*    <InputNumber w='100px' value={params.modelCount} />*/}
                        {/*    <Info tip={t(dict.proxy.ensembleSizeModels)} />*/}
                        {/*</FormField>*/}
                        <FormField title={t(dict.proxy.adaptationPeriod)} disabled={true}>
                            <HStack spacing={1}>
                                <DatePicker selected={params.adaptationStart} disabled={true} />
                                <Text>-</Text>
                                <DatePicker selected={params.adaptationEnd} disabled={true} />
                            </HStack>
                        </FormField>
                        <EngineSelector disabled={false} />
                        <Accordion defaultIndex={[0]} allowMultiple>
                            <CommonSettings />
                            <GeoModelSettings />
                            <SkinFactorSettings />
                            <PermeabilitiesSettings />
                            <WeightsSettings />
                        </Accordion>
                    </ModalBody>
                    <ModalFooter>
                        <Spacer />
                        <ButtonGroup>
                            <Button variant='primary' onClick={handleSubmit}>
                                {t(dict.calculation.title)}
                            </Button>
                            <Button onClick={handleClose} variant='cancel'>
                                {t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
