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
import { EngineSelector } from 'proxy/subModules/preparation/components/engineSelector';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { creationOpts, toPeriodValue, updPeriod } from '../../../../../calculation/enums/periodEnum';
import { currentScenarioItem } from '../../../../../calculation/store/currentScenarioId';
import { currentSubScenarioItem } from '../../../../../calculation/store/currentSubScenarioId';
import { insimCalcParams } from '../../../../../calculation/store/insimCalcParams';
import { useInsimMutations } from '../../../../../calculation/store/insimMutations';
import { NextIcon } from '../../../../../common/components/customIcon/general';
import { DatePicker } from '../../../../../common/components/datePicker';
import { Dropdown } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { InputNumber } from '../../../../../common/components/inputNumber';
import { firstDay } from '../../../../../common/helpers/date';
import { shallow } from '../../../../../common/helpers/ramda';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const LaunchCalculationModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const scenarioItem = useRecoilValue(currentScenarioItem);
    const subScenarioItem = useRecoilValue(currentSubScenarioItem);

    const [params, setParams] = useRecoilState(insimCalcParams);

    const dispatcher = useInsimMutations();

    const handleOpenClick = () => {
        onOpen();
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        dispatcher.startPrediction();

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
                {t(dict.common.calc)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='2xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Запуск прогноза</ModalHeader>
                    <ModalBody>
                        <FormField title={t(dict.common.scenario)}>
                            <Text>{scenarioItem.name}</Text>
                        </FormField>
                        <FormField title={t(dict.common.subScenario)}>
                            <Text>{subScenarioItem?.name}</Text>
                        </FormField>
                        <EngineSelector disabled={false} />
                        <FormField
                            title={`${t(dict.proxy.params.shutdownWellsWatercut)}, ${t(dict.common.units.percent)}`}
                        >
                            <InputNumber
                                w='100px'
                                value={params.watercutLimit}
                                onChange={val => setParams(shallow(params, { watercutLimit: +val }))}
                            />
                            <Info tip={t(dict.proxy.tips.maximumWatercutAfterWellStopped)} />
                        </FormField>
                        <FormField
                            title={`${t(dict.proxy.params.shutdownWellsOilProduction)}, ${t(
                                dict.common.units.tonsPerDay
                            )}`}
                        >
                            <InputNumber
                                w='100px'
                                value={params.oilRateLimit}
                                onChange={val => setParams(shallow(params, { oilRateLimit: +val }))}
                            />
                            <Info tip={t(dict.proxy.tips.minimumOilProductionWellStopped)} />
                        </FormField>
                        <FormField title={t(dict.prediction.calc.startDate)}>
                            <DatePicker selected={params.adaptationEnd} width='150px' disabled={true} />
                            <Info tip={null} />
                        </FormField>
                        <FormField title={t(dict.prediction.calc.endDate)}>
                            <DatePicker
                                selected={params.forecastEnd}
                                width='150px'
                                disabled={false}
                                onChange={d => setParams(shallow(params, { forecastEnd: firstDay(d) }))}
                            />
                            <Info tip={null} />
                        </FormField>
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
