import React, { FC, useEffect, useState } from 'react';

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Divider,
    Flex,
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
import { always, assoc, cond, equals, flatten, isNil, map, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { allPlasts } from '../../../../../calculation/store/plasts';
import { selectedPolygonState, togglePolygonState } from '../../../../../calculation/store/polygon';
import { scenariosState } from '../../../../../calculation/store/scenarios';
import { DatePicker } from '../../../../../common/components/datePicker';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { InputNumber } from '../../../../../common/components/inputNumber';
import { CalculationProgress } from '../../../../../common/components/kriging/calculationProgress';
import { BatchIntervalEvent } from '../../../../../common/entities/batchIntervalEvent';
import { isNullOrEmpty, shallow } from '../../../../../common/helpers/ramda';
import {
    CalculationSettingsModel,
    InterwellsCalculationParams
} from '../../../../entities/proxyMap/calculationSettingsModel';
import { currentSpot } from '../../../../store/well';
import { batchStatusState } from '../../store/batchStatus';
import { calculationSettingsState, interwellsCalculationParamsState } from '../../store/calculcationSettings';
import { useScenarioMutations } from '../../store/scenarioMutations';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface CalculationState {
    innerModel: CalculationSettingsModel;
    showCalcModelSection: boolean;
    showDevelopmentSection: boolean;
    showInterwellsSection: boolean;
}

export const СalculationScenariosModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const batchStatus = useRecoilValue(batchStatusState);
    const calculationSettings = useRecoilValue(calculationSettingsState);
    const plasts = useRecoilValue(allPlasts);
    const scenarios = useRecoilValue(scenariosState);
    const well = useRecoilValue(currentSpot);

    const [selectedPolygon, setSelectedPolygon] = useRecoilState(selectedPolygonState);
    const [interwellsCalcParams, setInterwellsCalcParams] = useRecoilState(interwellsCalculationParamsState);

    const resetTogglePolygon = useResetRecoilState(togglePolygonState);

    const dispatcher = useScenarioMutations();

    const plastId = () => {
        return calculationSettings.plastId;
    };

    const [state, setState] = useState<CalculationState>({
        innerModel: shallow(calculationSettings, {
            plastId: plastId()
            //drillingStartDate: mapSettings.maxMerDate
        }),
        showCalcModelSection: false,
        showDevelopmentSection: true,
        showInterwellsSection: false
    });

    const [isCalculation, setIsCalculation] = React.useState<boolean>(false);
    const [batchIntervalEvent] = React.useState<BatchIntervalEvent>(new BatchIntervalEvent());

    const handleCheckBatchStatus = () => {
        dispatcher.checkStatus();
    };

    useEffect(() => {
        if (!isNullOrEmpty(selectedPolygon)) {
            onOpen();
        }
    }, [selectedPolygon, onOpen]);

    useEffect(() => {
        if (!isCalculation && batchStatus) {
            batchIntervalEvent.activateBatchCache(
                batchStatus,
                `proxy_scenarios_${well.prodObjId}`,
                handleCheckBatchStatus
            );

            setIsCalculation(true);
        }

        setState(shallow(state, { innerModel: calculationSettings }));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchStatus]);

    const handleOpenClick = () => {
        onOpen();
    };

    const handleClose = () => {
        batchIntervalEvent.stop();
        dispatcher.refreshScenarios();
        dispatcher.clearBatchStatus(false);
        setIsCalculation(false);
        setSelectedPolygon([]);
        resetTogglePolygon();
        onClose();
    };

    const handleSubmit = () => {
        dispatcher.startCalculation(
            shallow(state.innerModel, {
                oilFieldId: well.oilFieldId,
                productionObjectId: well.prodObjId,
                selectedPolygon: selectedPolygon
            })
        );
    };

    const forceAbort = () => {
        batchIntervalEvent.stop();
        dispatcher.clearBatchStatus(true);
    };

    const getStepProgress = () => {
        if (isNil(batchStatus)) {
            return null;
        }

        const stepName = cond([
            [equals('SevenPoint'), always(t(dict.proxy.stepProgress.sevenPoint))],
            [equals('Square'), always(t(dict.proxy.stepProgress.square))],
            [equals('Mitchell'), always(t(dict.proxy.stepProgress.mitchell))],
            [equals('Poisson'), always(t(dict.proxy.stepProgress.poisson))],
            [equals('Remove'), always(t(dict.proxy.stepProgress.remove))],
            [equals('InitProcessing'), always(t(dict.proxy.stepProgress.initProcessing))],
            [equals('PostProcessing'), always(t(dict.proxy.stepProgress.postProcessing))],
            [equals('Combination'), always(t(dict.proxy.stepProgress.combination))],
            [T, always('')]
        ])(batchStatus.stepName);

        return {
            stepName: stepName,
            currentNumber: batchStatus.currentNumber,
            totalCount: batchStatus.totalCount
        };
    };

    const update = <K extends keyof InterwellsCalculationParams>(key: K, value: InterwellsCalculationParams[K]) =>
        setInterwellsCalcParams(assoc(key, value, interwellsCalcParams) as InterwellsCalculationParams);

    function updateSettings<K extends keyof CalculationSettingsModel>(key: K, value: CalculationSettingsModel[K]) {
        setState(shallow(state, { innerModel: assoc(key, value, state.innerModel) } as Partial<CalculationState>));
    }

    const plastDropdown: DropdownProps = {
        onChange: e => updateSettings('plastId', +e.target.value),
        options: flatten([
            new DropdownOption(null, t(dict.common.all)),
            map(it => new DropdownOption(it.id, it.name), plasts)
        ]),
        value: state.innerModel.plastId
    };

    const scenarioDropdown: DropdownProps = {
        onChange: e => updateSettings('scenarioId', +e.target.value),
        options: flatten([
            new DropdownOption(null, t(dict.common.notUse)),
            map(it => new DropdownOption(it.id, it.name), scenarios)
        ]),
        value: state.innerModel.scenarioId
    };

    const calculationProgressTitle = () => {
        const { countLoop } = state.innerModel;

        let defaultTitle = null;

        if (!batchStatus) {
            return defaultTitle;
        }

        // TODO: перевод
        return batchStatus.loopNumber && countLoop > 1
            ? `${defaultTitle} по циклу ${batchStatus.loopNumber} из ${countLoop}`
            : defaultTitle;
    };

    return (
        <>
            <Button onClick={handleOpenClick} variant='primary' ml={3}>
                {t(dict.calculation.scenarios.title)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='3xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.calculation.scenarios.title)}</ModalHeader>
                    {batchStatus ? (
                        <ModalBody>
                            <Box height='300px'>
                                <CalculationProgress
                                    className='kriging__step kriging__step_calc'
                                    title={calculationProgressTitle()}
                                    forceAbort={forceAbort}
                                    abort={dispatcher.abortCalculation}
                                    batch={batchStatus}
                                    mapNames={[]}
                                    stepProgress={getStepProgress()}
                                    goToMap={handleClose}
                                    goToParams={() => setIsCalculation(false)}
                                />
                            </Box>
                        </ModalBody>
                    ) : (
                        <>
                            <ModalBody>
                                <FormField title={t(dict.proxy.selectingPlastForCalculation)}>
                                    <Dropdown className='dropdown_well-types' {...plastDropdown} />
                                    <Info tip={t(dict.proxy.selectingPlastForCalculation)} />
                                </FormField>
                                <FormField title={t(dict.calculation.scenarios.basedOnScenario)}>
                                    <Dropdown className='dropdown_well-types' {...scenarioDropdown} />
                                    <Info tip={t(dict.calculation.scenarios.basedOnScenario)} />
                                </FormField>
                                <FormField title={t(dict.proxy.calculationStep)}>
                                    <InputNumber
                                        value={state.innerModel.countStep}
                                        step={1}
                                        min={1}
                                        max={100}
                                        w={'100px'}
                                        onChange={value => updateSettings('countStep', +value)}
                                    />
                                </FormField>
                                <FormField title={t(dict.calculation.scenarios.numberCycles)}>
                                    <InputNumber
                                        value={state.innerModel.countLoop}
                                        step={1}
                                        min={1}
                                        max={10}
                                        w={'100px'}
                                        onChange={value => updateSettings('countLoop', +value)}
                                    />
                                </FormField>
                                <FormField title={t(dict.calculation.scenarios.horizontalCalculation)}>
                                    <Checkbox
                                        isChecked={state.innerModel.horizontalCalculation}
                                        onChange={e => updateSettings('horizontalCalculation', e.target.checked)}
                                    />
                                </FormField>
                                <FormField title={t(dict.calculation.scenarios.deleteCalculationScenarios)}>
                                    <Checkbox
                                        isChecked={state.innerModel.clearCalcGrid}
                                        onChange={e => updateSettings('clearCalcGrid', e.target.checked)}
                                    />
                                </FormField>
                                <Accordion defaultIndex={[0]} my='10px'>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box pr={2} textAlign='left' textTransform='uppercase'>
                                                {t(dict.calculation.scenarios.selectionCalcModels)}
                                            </Box>
                                            <AccordionIcon color='icons.grey' />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <CalculationModelItem
                                                title={t(dict.proxy.wellGrid.calcTypes.sevenPoint)}
                                                checked={state.innerModel.checkedSevenPoint}
                                                inputValue={state.innerModel.numberSevenPoint}
                                                onChangeCheckbox={checked =>
                                                    updateSettings('checkedSevenPoint', checked)
                                                }
                                                onChangeInput={value => updateSettings('numberSevenPoint', value)}
                                            />
                                            <CalculationModelItem
                                                title={t(dict.proxy.wellGrid.calcTypes.square)}
                                                checked={state.innerModel.checkedSquare}
                                                inputValue={state.innerModel.numberSquare}
                                                onChangeCheckbox={checked => updateSettings('checkedSquare', checked)}
                                                onChangeInput={value => updateSettings('numberSquare', value)}
                                            />
                                            <CalculationModelItem
                                                title={t(dict.proxy.wellGrid.calcTypes.mitchell)}
                                                checked={state.innerModel.checkedMitchell}
                                                inputValue={state.innerModel.numberMitchell}
                                                onChangeCheckbox={checked => updateSettings('checkedMitchell', checked)}
                                                onChangeInput={value => updateSettings('numberMitchell', value)}
                                            />
                                            <CalculationModelItem
                                                title={t(dict.proxy.wellGrid.calcTypes.poisson)}
                                                checked={state.innerModel.checkedPoisson}
                                                inputValue={state.innerModel.numberPoisson}
                                                onChangeCheckbox={checked => updateSettings('checkedPoisson', checked)}
                                                onChangeInput={value => updateSettings('numberPoisson', value)}
                                            />
                                        </AccordionPanel>
                                    </AccordionItem>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box pr={2} textAlign='left' textTransform='uppercase'>
                                                {t(dict.kriging.groups.limitations)}
                                            </Box>
                                            <AccordionIcon color='icons.grey' />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <FormField title={t(dict.calculation.subscenarios.distanceBetweenWells)}>
                                                <InputNumber
                                                    value={state.innerModel.distance}
                                                    step={10}
                                                    min={10}
                                                    max={10000}
                                                    w={'100px'}
                                                    onChange={value => updateSettings('distance', +value)}
                                                />
                                            </FormField>
                                            <FormField title={t(dict.calculation.scenarios.offsetFromContours)}>
                                                <InputNumber
                                                    value={state.innerModel.contourIndent}
                                                    step={10}
                                                    min={10}
                                                    max={10000}
                                                    w={'100px'}
                                                    onChange={value => updateSettings('contourIndent', +value)}
                                                />
                                            </FormField>
                                            <FormField title={t(dict.calculation.scenarios.offsetFromLicenseBorder)}>
                                                <InputNumber
                                                    value={state.innerModel.minDistanceToLicense}
                                                    step={1}
                                                    min={10}
                                                    max={10000}
                                                    w={'100px'}
                                                    onChange={value => updateSettings('minDistanceToLicense', +value)}
                                                />
                                            </FormField>
                                            <FormField
                                                title={t(dict.calculation.scenarios.considerContoursCalculating)}
                                            >
                                                <Checkbox
                                                    isChecked={state.innerModel.useContour}
                                                    onChange={e => updateSettings('useContour', e.target.checked)}
                                                />
                                            </FormField>
                                        </AccordionPanel>
                                    </AccordionItem>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box pr={2} textAlign='left' textTransform='uppercase'>
                                                {t(dict.calculation.scenarios.development)}
                                            </Box>
                                            <AccordionIcon color='icons.grey' />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <FormField title={t(dict.calculation.scenarios.useDesignMode)}>
                                                <Checkbox
                                                    isChecked={state.innerModel.useDevelopmentMode}
                                                    onChange={e =>
                                                        updateSettings('useDevelopmentMode', e.target.checked)
                                                    }
                                                />
                                            </FormField>
                                            <FormField title={t(dict.calculation.rateDrilling)}>
                                                <InputNumber
                                                    value={state.innerModel.drillingRate}
                                                    isDisabled={!state.innerModel.useDevelopmentMode}
                                                    step={1}
                                                    min={1}
                                                    max={36}
                                                    w={'100px'}
                                                    onChange={value => updateSettings('drillingRate', +value)}
                                                />
                                            </FormField>
                                            <FormField title={t(dict.calculation.subscenarios.drillingStartDate)}>
                                                <DatePicker
                                                    withPortal
                                                    selected={state.innerModel.drillingStartDate}
                                                    width='150px'
                                                    disabled={!state.innerModel.useDevelopmentMode}
                                                    onChange={d => updateSettings('drillingStartDate', d)}
                                                />
                                            </FormField>
                                        </AccordionPanel>
                                    </AccordionItem>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box pr={2} textAlign='left' textTransform='uppercase'>
                                                {t(dict.common.interwellConnections)}
                                            </Box>
                                            <AccordionIcon color='icons.grey' />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <FormField title={t(dict.proxy.calculateInterwellConnections)}>
                                                <Checkbox
                                                    isChecked={state.innerModel.calcInterwellConnections}
                                                    onChange={e =>
                                                        updateSettings('calcInterwellConnections', e.target.checked)
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                title={`${t(dict.proxy.params.neighborSelectionRadius)}, ${t(
                                                    dict.common.units.meter
                                                )}`}
                                            >
                                                <InputNumber
                                                    value={interwellsCalcParams.radius}
                                                    isDisabled={!state.innerModel.calcInterwellConnections}
                                                    step={10}
                                                    min={50}
                                                    max={5000}
                                                    w={'100px'}
                                                    onChange={value => update('radius', +value)}
                                                />
                                            </FormField>
                                            <FormField
                                                title={`${t(dict.proxy.params.minimumRadius)}, ${t(
                                                    dict.common.units.meter
                                                )}`}
                                            >
                                                <InputNumber
                                                    value={interwellsCalcParams.deadRadius}
                                                    isDisabled={!state.innerModel.calcInterwellConnections}
                                                    step={10}
                                                    min={1}
                                                    max={2000}
                                                    w={'100px'}
                                                    onChange={value => update('deadRadius', +value)}
                                                />
                                            </FormField>
                                            <FormField
                                                title={`${t(dict.proxy.params.searchAngle)}, ${t(
                                                    dict.common.units.degree
                                                )}`}
                                            >
                                                <InputNumber
                                                    value={interwellsCalcParams.searchAngle}
                                                    isDisabled={!state.innerModel.calcInterwellConnections}
                                                    step={1}
                                                    min={1}
                                                    max={360}
                                                    w={'100px'}
                                                    onChange={value => update('searchAngle', +value)}
                                                />
                                            </FormField>
                                            <FormField title={t(dict.proxy.considerIntermediateWells)}>
                                                <Checkbox
                                                    isChecked={interwellsCalcParams.intermediateWells}
                                                    isDisabled={!state.innerModel.calcInterwellConnections}
                                                    onChange={e => update('intermediateWells', e.target.checked)}
                                                />
                                            </FormField>
                                        </AccordionPanel>
                                    </AccordionItem>
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
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

interface CalculationModelProps {
    title: string;
    checked: boolean;
    inputValue: number;
    onChangeCheckbox: (checked: boolean) => void;
    onChangeInput: (value: number) => void;
}

const CalculationModelItem: FC<CalculationModelProps> = (p: CalculationModelProps) => {
    const { t } = useTranslation();
    return (
        <FormField title={p.title}>
            <Flex justifyContent='space-between' alignItems='center' w='100%'>
                <Checkbox isChecked={p.checked} onChange={e => p.onChangeCheckbox(e.target.checked)} />
                {p.checked ? (
                    <>
                        <Divider w={6} />
                        <Text>{t(dict.calculation.scenarios.numberScenarios)}</Text>
                        <InputNumber
                            value={p.inputValue}
                            w={'75px'}
                            step={1}
                            min={1}
                            max={100}
                            onChange={value => p.onChangeInput(+value)}
                        />
                    </>
                ) : null}
            </Flex>
        </FormField>
    );
};
