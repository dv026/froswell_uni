import React, { FC, useState } from 'react';

import {
    Box,
    Button,
    ButtonGroup,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    useDisclosure
} from '@chakra-ui/react';
import i18n from 'i18next';
import { assoc, flatten, map } from 'ramda';
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';

import { currentScenarioId } from '../../../../../calculation/store/currentScenarioId';
import { allPlasts } from '../../../../../calculation/store/plasts';
import { DatePicker } from '../../../../../common/components/datePicker';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { InputNumber } from '../../../../../common/components/inputNumber';
import { CalculationProgress } from '../../../../../common/components/kriging/calculationProgress';
import { BatchIntervalEvent } from '../../../../../common/entities/batchIntervalEvent';
import { shallow } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { CalculationSubScenariosModel } from '../../../../../proxy/entities/proxyMap/calculationSubScenariosModel';
import { mapSettingsState } from '../../../../../proxy/store/map/mapSettings';
import { MapSettingModel } from '../../../../entities/mapSettingModel';
import { currentSpot } from '../../../../store/well';
import { batchStatusState } from '../../store/batchStatus';
import { calculationSettingsState } from '../../store/calculcationSettings';
import { useSubScenarioMutations } from '../../store/subScenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface CalculationState {
    innerModel: CalculationSubScenariosModel;
}

export const СalculationSubScenariosModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const mapSettingsLoadable = useRecoilValueLoadable(mapSettingsState);

    const batchStatus = useRecoilValue(batchStatusState);
    const calculationSettings = useRecoilValue(calculationSettingsState);
    const plasts = useRecoilValue(allPlasts);
    const scenarioId = useRecoilValue(currentScenarioId);
    const well = useRecoilValue(currentSpot);

    const dispatcher = useSubScenarioMutations();

    const mapSettings = hasValue(mapSettingsLoadable) ? mapSettingsLoadable.contents : new MapSettingModel();

    const plastId = () => {
        return calculationSettings.plastId;
    };

    const [state, setState] = useState<CalculationState>({
        innerModel: shallow(calculationSettings, {
            plastId: plastId(),
            drillingStartDate: mapSettings.maxMerDate
        })
    });

    const [isCalculation, setIsCalculation] = React.useState<boolean>(false);
    const [batchIntervalEvent] = React.useState<BatchIntervalEvent>(new BatchIntervalEvent());

    const handleCheckBatchStatus = () => {
        dispatcher.checkStatus();
    };

    React.useEffect(() => {
        if (!isCalculation && batchStatus) {
            batchIntervalEvent.activateBatchCache(
                batchStatus,
                `proxy_subScenarios_${well.prodObjId}`,
                handleCheckBatchStatus
            );

            setIsCalculation(true);
        }

        setState(
            shallow(state, {
                innerModel: shallow(calculationSettings, {
                    plastId: plastId(),
                    drillingStartDate: mapSettings.maxMerDate
                })
            })
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchStatus]);

    const handleOpenClick = () => {
        onOpen();
    };

    const handleClose = () => {
        batchIntervalEvent.stop();
        dispatcher.clearBatchStatus(false);
        setIsCalculation(false);
        onClose();
    };

    const handleSubmit = () => {
        dispatcher.startCalculation(
            shallow(state.innerModel, { productionObjectId: well.prodObjId, scenarioId: scenarioId })
        );
    };

    const forceAbort = () => {
        batchIntervalEvent.stop();
        dispatcher.clearBatchStatus(true);
    };

    function updateSettings<K extends keyof CalculationSubScenariosModel>(
        key: K,
        value: CalculationSubScenariosModel[K]
    ) {
        setState(shallow(state, { innerModel: assoc(key, value, state.innerModel) as CalculationSubScenariosModel }));
    }

    const plastDropdown: DropdownProps = {
        onChange: e => updateSettings('plastId', +e.target.value),
        options: flatten([
            new DropdownOption(null, i18n.t(dict.common.all)),
            map(it => new DropdownOption(it.id, it.name), plasts)
        ]),
        value: state.innerModel.plastId
    };

    return (
        <>
            <Button onClick={handleOpenClick} variant='primary' ml={3}>
                {i18n.t(dict.calculation.subscenarios.calcSubscenarios)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='3xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.calculation.subscenarios.calcSubscenarios)}</ModalHeader>
                    {batchStatus ? (
                        <ModalBody>
                            <Box height='300px'>
                                <CalculationProgress
                                    className='kriging__step kriging__step_calc'
                                    title={i18n.t(dict.calculation.title)}
                                    forceAbort={forceAbort}
                                    abort={dispatcher.abortCalculation}
                                    batch={batchStatus}
                                    mapNames={[
                                        i18n.t(dict.calculation.subscenarios.deletingAutoSubscripts),
                                        i18n.t(dict.calculation.subscenarios.calculationAndCreation)
                                    ]}
                                    stepProgress={null}
                                    goToMap={handleClose}
                                    goToParams={() => setIsCalculation(false)}
                                />
                            </Box>
                        </ModalBody>
                    ) : (
                        <>
                            <ModalBody>
                                <FormField title={i18n.t(dict.proxy.selectingPlastForCalculation)}>
                                    <Dropdown className='dropdown_well-types' {...plastDropdown} />
                                    <Info tip={i18n.t(dict.proxy.selectingPlastForCalculation)} />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.subscenarios.numberSubscenarios)}>
                                    <InputNumber
                                        value={state.innerModel.numberSubScenarios}
                                        step={1}
                                        min={1}
                                        max={100}
                                        w={'100px'}
                                        onChange={value => updateSettings('numberSubScenarios', +value)}
                                    />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.rateDrilling)}>
                                    <InputNumber
                                        value={state.innerModel.drillingRate}
                                        step={1}
                                        min={1}
                                        max={100}
                                        w={'100px'}
                                        onChange={value => updateSettings('drillingRate', +value)}
                                    />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.subscenarios.drillingStartDate)}>
                                    <DatePicker
                                        selected={state.innerModel.drillingStartDate}
                                        width='150px'
                                        onChange={d => updateSettings('drillingStartDate', d)}
                                    />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.subscenarios.distanceBetweenWells)}>
                                    <InputNumber
                                        value={state.innerModel.dist}
                                        step={10}
                                        min={10}
                                        max={10000}
                                        w={'100px'}
                                        onChange={value => updateSettings('dist', +value)}
                                    />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.subscenarios.transferWellsForInjection)}>
                                    <InputNumber
                                        value={state.innerModel.monthInjectionStart}
                                        step={1}
                                        min={1}
                                        max={100}
                                        w={'100px'}
                                        onChange={value => updateSettings('monthInjectionStart', +value)}
                                    />
                                </FormField>
                                <FormField title={i18n.t(dict.calculation.subscenarios.injectionPeriod)}>
                                    <InputNumber
                                        value={state.innerModel.intervalInjection}
                                        step={1}
                                        min={1}
                                        max={100}
                                        w={'100px'}
                                        onChange={value => updateSettings('intervalInjection', +value)}
                                    />
                                </FormField>
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
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
