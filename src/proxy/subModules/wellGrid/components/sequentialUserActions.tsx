import React, { FC, PropsWithChildren } from 'react';

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
    Flex,
    FormControl,
    Heading,
    Spacer,
    Text
} from '@chakra-ui/react';
import { assoc, filter, head } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil';

import { CalculationModeEnum } from '../../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../../calculation/store/calculationMode';
import { currentPlastId, currentPlastName } from '../../../../calculation/store/currentPlastId';
import { allPlasts } from '../../../../calculation/store/plasts';
import { Curtain } from '../../../../common/components/curtain';
import { ActiveStepIcon, CompleteIcon, NextIcon, NextStepIcon } from '../../../../common/components/customIcon/general';
import { FormField } from '../../../../common/components/formField';
import { InputNumber } from '../../../../common/components/inputNumber';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { shallowEqual } from '../../../../common/helpers/compare';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { hasValue } from '../../../../common/helpers/recoil';
import { InterwellsCalculationParams } from '../../../entities/proxyMap/calculationSettingsModel';
import { MapSettingModel } from '../../../entities/proxyMap/mapSettingModel';
import { mapSettingsState } from '../../../store/map/mapSettings';
import { useProxyMapMutations } from '../../../store/map/proxyMapMutations';
import { interwellsCalculationParamsState } from '../../model/store/calculcationSettings';
import { GeologicalReserveType } from '../enums/geologicalReserveType';
import { addImaginaryModeState } from '../store/addImaginaryMode';
import { aquiferIsLoadingState, indentWaterOilContactState } from '../store/aquifer';
import { geologicalReservesByType } from '../store/geologicalReserves';
import { interwellsIsLoadingState } from '../store/intewells';
import { GeologicalReserves } from './geologicalReserves';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const SequentialUserActions = () => {
    const { t } = useTranslation();

    const mapSettingsLoadable = useRecoilValueLoadable(mapSettingsState);

    const calculationMode = useRecoilValue(calculationModeState);
    const isLoading = useRecoilValue(interwellsIsLoadingState);
    const isLoadingAquifer = useRecoilValue(aquiferIsLoadingState);
    const plastName = useRecoilValue(currentPlastName);
    const plasts = useRecoilValue(allPlasts);
    const reserves = useRecoilValue(geologicalReservesByType(GeologicalReserveType.All));

    const [indentWaterOilContact, setIndentWaterOilContact] = useRecoilState(indentWaterOilContactState);
    const [interwellsCalcParams, setInterwellsCalcParams] = useRecoilState(interwellsCalculationParamsState);

    const [plastId, setPlast] = useRecoilState(currentPlastId);
    const [addMode, setAddMode] = useRecoilState(addImaginaryModeState);

    const dispatcher = useProxyMapMutations();

    const mapSettings = hasValue(mapSettingsLoadable) ? (mapSettingsLoadable.contents as MapSettingModel) : null;
    const anyVirtualWells = mapSettings && !isNullOrEmpty(mapSettings?.imaginaryPoints);
    const anyInterwellConnections = mapSettings && !isNullOrEmpty(mapSettings?.interwellConnections);
    const aquiferIsEmpty = isNullOrEmpty(mapSettings?.aquifers);
    const nextPlast = head(filter(it => it.id > plastId, plasts));
    const noChanged = shallowEqual(mapSettings?.imaginaryPoints, mapSettings?.originalImaginaryPoints);
    const isCreation = calculationMode === CalculationModeEnum.Creation;
    const isImprovement = calculationMode === CalculationModeEnum.Improvement;
    const allowCalcInterwellConnections =
        isCreation ||
        (isImprovement &&
            mapSettings?.availableGrids.includes(GridMapEnum.InitialInterwellVolumeAfterAdaptation) &&
            mapSettings?.availableGrids.includes(GridMapEnum.InitialTransmissibilityAfterAdaptation) &&
            mapSettings?.availableGrids.includes(GridMapEnum.VolumeWaterCut));

    const allowNextPlast = anyInterwellConnections && allowCalcInterwellConnections && noChanged;

    const update = <K extends keyof InterwellsCalculationParams>(key: K, value: InterwellsCalculationParams[K]) =>
        setInterwellsCalcParams(assoc(key, value, interwellsCalcParams) as InterwellsCalculationParams);

    return (
        <Curtain key={plastId} position={'top-right'}>
            <Box p={0}>
                <Heading size='h3'>{t(dict.proxy.wellGridEditing)}</Heading>
                <Heading size='h5' py='8px'>
                    {t(dict.common.plast)}: {plastName}
                </Heading>
                <Box w='350px'>
                    <Accordion my='10px' defaultIndex={anyVirtualWells ? (isImprovement ? 2 : 3) : 0}>
                        {/* Виртуальные скважины */}
                        <Step
                            title={t(dict.proxy.addVirtualWells)}
                            subTitle={t(dict.proxy.addWellsToMap)}
                            selected={!anyVirtualWells}
                            complete={anyVirtualWells}
                            disabled={false}
                        >
                            {anyVirtualWells ? (
                                <>
                                    <FormControl py={3}>
                                        <Checkbox isChecked={addMode} onChange={e => setAddMode(e.target.checked)}>
                                            {t(dict.proxy.addToAllPlasts)}
                                        </Checkbox>
                                    </FormControl>
                                    <ButtonGroup variant='cancel' size={'sm'}>
                                        <Button
                                            isDisabled={noChanged || isLoading}
                                            minW='100px'
                                            variant='primary'
                                            onClick={() => dispatcher.saveAllImaginaryWells()}
                                        >
                                            {t(dict.common.save)}
                                        </Button>
                                        <Button
                                            isDisabled={noChanged || isLoading}
                                            minW='100px'
                                            onClick={() => dispatcher.backToOriginalData()}
                                        >
                                            {t(dict.common.cancel)}
                                        </Button>
                                    </ButtonGroup>
                                </>
                            ) : null}
                        </Step>
                        {/* Аквифер */}
                        {isImprovement ? null : (
                            <Step title={t(dict.proxy.addAquifer)} complete={!aquiferIsEmpty}>
                                <FormField title={t(dict.proxy.params.indentWaterOilContact)}>
                                    <InputNumber
                                        value={indentWaterOilContact}
                                        step={1}
                                        min={1}
                                        max={2000}
                                        w={'100px'}
                                        onChange={value => setIndentWaterOilContact(+value)}
                                    />
                                </FormField>
                                <ButtonGroup variant='cancel' size={'sm'}>
                                    <Button
                                        isDisabled={isLoadingAquifer}
                                        isLoading={isLoadingAquifer}
                                        minW='100px'
                                        variant='primary'
                                        onClick={() => dispatcher.saveAquifer()}
                                    >
                                        {t(dict.common.save)}
                                    </Button>
                                    <Button
                                        minW='100px'
                                        isDisabled={aquiferIsEmpty || isLoadingAquifer}
                                        onClick={() => dispatcher.removeAquifer()}
                                    >
                                        {t(dict.common.remove)}
                                    </Button>
                                </ButtonGroup>
                            </Step>
                        )}
                        {/* Геологические запасы  */}
                        <Step
                            title={t(dict.proxy.wellGrid.geologicalReserves)}
                            disabled={!anyVirtualWells || !reserves}
                            complete={!!reserves}
                        >
                            <GeologicalReserves />
                        </Step>
                        {/* Межскважинные соединения  */}
                        <Step
                            title={t(dict.proxy.calculateInterwellConnections)}
                            selected={anyVirtualWells}
                            complete={anyVirtualWells && allowCalcInterwellConnections && noChanged}
                            disabled={!anyVirtualWells}
                        >
                            <FormField
                                title={`${t(dict.proxy.params.neighborSelectionRadius)}, ${t(dict.common.units.meter)}`}
                                ratio={[70, 30]}
                            >
                                <InputNumber
                                    value={interwellsCalcParams.radius}
                                    step={10}
                                    min={50}
                                    max={5000}
                                    w={'100px'}
                                    onChange={value => update('radius', +value)}
                                />
                            </FormField>
                            <FormField
                                title={`${t(dict.proxy.params.minimumRadius)}, ${t(dict.common.units.meter)}`}
                                ratio={[70, 30]}
                            >
                                <InputNumber
                                    value={interwellsCalcParams.deadRadius}
                                    step={10}
                                    min={1}
                                    max={2000}
                                    w={'100px'}
                                    onChange={value => update('deadRadius', +value)}
                                />
                            </FormField>
                            <FormField
                                title={`${t(dict.proxy.params.searchAngle)}, ${t(dict.common.units.degree)}`}
                                ratio={[70, 30]}
                            >
                                <InputNumber
                                    value={interwellsCalcParams.searchAngle}
                                    step={1}
                                    min={1}
                                    max={360}
                                    w={'100px'}
                                    onChange={value => update('searchAngle', +value)}
                                />
                            </FormField>
                            <FormField title={t(dict.proxy.considerIntermediateWells)} ratio={[70, 30]}>
                                <Checkbox
                                    isChecked={interwellsCalcParams.intermediateWells}
                                    onChange={e => update('intermediateWells', e.target.checked)}
                                />
                            </FormField>
                            <ButtonGroup variant='cancel' size={'sm'}>
                                <Button
                                    isDisabled={!anyVirtualWells || !allowCalcInterwellConnections}
                                    isLoading={isLoading}
                                    minW='100px'
                                    variant='primary'
                                    onClick={() => dispatcher.calculateInterwellConnections(interwellsCalcParams)}
                                >
                                    {t(dict.common.calc)}
                                </Button>
                                <Button
                                    minW='100px'
                                    isDisabled={!anyVirtualWells || isLoading}
                                    onClick={() => dispatcher.deleteInterwellConnections()}
                                >
                                    {t(dict.common.remove)}
                                </Button>
                            </ButtonGroup>
                        </Step>
                    </Accordion>
                </Box>
            </Box>
            {nextPlast && (
                <Box>
                    <Flex>
                        <Spacer />
                        <Button
                            rightIcon={<NextIcon boxSize={6} />}
                            variant='nextStage'
                            isDisabled={!allowNextPlast}
                            onClick={() => setPlast(nextPlast.id)}
                        >
                            {t(dict.proxy.wellGrid.nextPlast)}
                        </Button>
                    </Flex>
                </Box>
            )}
        </Curtain>
    );
};

interface IStepProps {
    title: string;
    subTitle?: string;
    selected?: boolean;
    disabled?: boolean;
    complete?: boolean;
}

const Step: FC<PropsWithChildren<IStepProps>> = (p: PropsWithChildren<IStepProps>) => {
    return (
        <AccordionItem bg={p.selected ? 'bg.selected' : 'none'} isDisabled={p.disabled} pr='5px'>
            <AccordionButton pt={'2px'} pl={'5px'}>
                <Flex flex='1' textAlign='left'>
                    <Box>
                        {p.disabled ? (
                            <NextStepIcon boxSize={7} color={'icons.grey'} />
                        ) : p.complete ? (
                            <CompleteIcon boxSize={7} color={'icons.green'} />
                        ) : (
                            <ActiveStepIcon boxSize={7} color={'bg.brand'} />
                        )}
                    </Box>
                    <Box pl={'5px'} color={p.disabled ? 'typo.secondary' : 'typo.primary'}>
                        <Heading size='h5' my='5px'>
                            {p.title}
                        </Heading>
                        {p.subTitle && !p.complete ? <Text>{p.subTitle}</Text> : null}
                    </Box>
                </Flex>
                <AccordionIcon color='icons.grey' />
            </AccordionButton>
            <AccordionPanel>
                <Box pl={'30px'}>{p.children}</Box>
            </AccordionPanel>
        </AccordionItem>
    );
};
