import React, { FC, MouseEventHandler, useCallback, useEffect, useState } from 'react';

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    ButtonGroup,
    Flex,
    Heading,
    HStack,
    Progress,
    ProgressLabel,
    Text
} from '@chakra-ui/react';
import { NoteManager } from 'calculation/components/notes';
import i18n from 'i18next';
import { always, cond, equals, filter, find, isNil, map, T, length } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { AdaptationTypeEnum } from '../../../../../calculation/entities/computation/adaptationTypeEnum';
import { CalculationStepEnum } from '../../../../../calculation/entities/computation/calculationBrief';
import {
    ComputationStatus,
    isFinished,
    stoppingByUser
} from '../../../../../calculation/entities/computation/computationStatus';
import { isAdaptation } from '../../../../../calculation/enums/calculationModeEnum';
import { computationStatusState } from '../../../../../calculation/store/computationStatus';
import { resultsAreAvailable } from '../../../../../calculation/store/insimCalcParams';
import { allPlasts } from '../../../../../calculation/store/plasts';
import { EmptyData } from '../../../../../common/components/emptyData';
import { FormField } from '../../../../../common/components/formField';
import { ContinueImprovementModal } from '../modal/continueImprovementModal';
import { getLastFinishedAdaptationType, getLabelByType } from '../utils';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface CalculationProgressProps {
    collapsed?: boolean;
    toResults: () => void;
    abort: () => void;
}

export const CalculationProgress: FC<CalculationProgressProps> = (p: CalculationProgressProps) => {
    const { t } = useTranslation();
    const plasts = useRecoilValue(allPlasts);
    const computationStatus = useRecoilValue(computationStatusState);
    const setHasResults = useSetRecoilState(resultsAreAvailable);

    const [collapsed, setCollapsed] = useState<number | number[]>();

    useEffect(() => {
        return () => {
            setHasResults(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setCollapsed(p.collapsed ? -1 : 0);
    }, [p.collapsed]);

    if (!computationStatus) {
        return <EmptyData text={t(dict.calculation.tipWaitUntilStart)} hideIcon={true} />;
    }

    const countModels = length(computationStatus?.calculations ?? []);
    const indexModel = Math.min(
        (computationStatus?.calculations ?? []).length,
        Math.max(
            1,
            1 +
                length(
                    filter(x => x.currentStep === CalculationStepEnum.Finished, computationStatus?.calculations ?? [])
                )
        )
    );

    const totalPercent = computationStatus.percent;

    const calculation = find(x => x.id === computationStatus?.details?.id, computationStatus.calculations);
    const currentStep = calculation ? calculation.currentStep : null;

    const iteration = computationStatus?.details?.currentA;

    const progressElement = (
        <Flex alignItems='center'>
            <Progress
                m='7px 0'
                w='600px'
                size='lg'
                isAnimated={true}
                isIndeterminate={totalPercent === 0}
                value={totalPercent}
            >
                <ProgressLabel>{totalPercent}%</ProgressLabel>
            </Progress>
            <NoteManager notes={computationStatus.notes ?? []} />
        </Flex>
    );

    return (
        <Accordion variant='custom' allowToggle index={collapsed} onChange={setCollapsed}>
            <AccordionItem>
                {({ isExpanded }) => (
                    <>
                        <AccordionButton height='42px'>
                            <Flex flex={1} gap={2} textAlign='left' onClick={e => e.stopPropagation()}>
                                <Heading size='h3' flexBasis={'160px'} margin='auto 0'>
                                    {t(dict.proxy.adaptation)}
                                </Heading>
                                {isExpanded ? null : (
                                    <>
                                        {progressElement}
                                        <Actions status={computationStatus} toResults={p.toResults} abort={p.abort} />
                                    </>
                                )}
                            </Flex>
                            <AccordionIcon boxSize={6} />
                        </AccordionButton>
                        <AccordionPanel w={'800px'} pb={4}>
                            <FormField title={t(dict.calculation.model)} ratio={[20, 80]}>
                                <Text fontWeight='bold'>
                                    {indexModel} {t(dict.calculation.from)} {countModels}
                                </Text>
                            </FormField>
                            <FormField title={t(dict.common.plasts)} ratio={[20, 80]}>
                                <HStack spacing={3}>
                                    {map(
                                        x => (
                                            <Box key={x.id}>{x.name}</Box>
                                        ),
                                        plasts
                                    )}
                                </HStack>
                            </FormField>
                            <FormField title={t(dict.calculation.stage)} ratio={[20, 80]}>
                                <Text>
                                    {getStepNameAdaptation(
                                        currentStep,
                                        iteration,
                                        getLastFinishedAdaptationType(computationStatus?.details?.adaptationDynamics)
                                    )}
                                </Text>
                            </FormField>
                            <FormField title={t(dict.calculation.progressTotal)} ratio={[20, 80]}>
                                {progressElement}
                            </FormField>
                            <FormField title={null} ratio={[20, 80]}>
                                <Actions status={computationStatus} toResults={p.toResults} abort={p.abort} />
                            </FormField>
                        </AccordionPanel>
                    </>
                )}
            </AccordionItem>
        </Accordion>
    );
};

const getStepNameAdaptation = (step: CalculationStepEnum, iteration: number, adaptationType: AdaptationTypeEnum) =>
    cond([
        [equals(CalculationStepEnum.Pending), always(i18n.t(dict.proxy.preparingForCalculation))],
        [equals(CalculationStepEnum.DataLoad), always(i18n.t(dict.proxy.receiveData))],
        [
            equals(CalculationStepEnum.Calculation),
            always(
                `${i18n.t(dict.proxy.calcAdaptation)}${iteration} ${
                    adaptationType ? '(' + getLabelByType(adaptationType) + ')' : ''
                }`
            )
        ],
        [equals(CalculationStepEnum.DataSave), always(`${i18n.t(dict.proxy.saveAdaptationNumber)}${iteration}`)],
        [equals(CalculationStepEnum.Finished), always(`${i18n.t(dict.proxy.completed)}`)],
        [equals(CalculationStepEnum.FinishedWithErrors), always(`${i18n.t(dict.proxy.completedWithErrors)}`)],
        [equals(CalculationStepEnum.StoppedByUser), always(`${i18n.t(dict.proxy.stoppedByUser)}`)],
        [equals(CalculationStepEnum.IsStoppingByUser), always(`${i18n.t(dict.proxy.stoppingByUser)}`)],
        [T, always('...')]
    ])(step);

interface ActionProps {
    status: ComputationStatus;
    toResults: () => void;
    abort: () => void;
}

const Actions: FC<ActionProps> = (p: ActionProps) => {
    const { t } = useTranslation();
    const hasResults = useRecoilValue(resultsAreAvailable);

    if (isNil(p.status)) {
        return null;
    }

    if (!isFinished(p.status)) {
        return (
            <Button variant='cancel' isLoading={stoppingByUser(p.status)} onClick={p.abort}>
                {i18n.t(dict.progress.abort)}
            </Button>
        );
    }

    return (
        hasResults && (
            <ButtonGroup spacing={2}>
                <Button variant='primary' onClick={p.toResults}>
                    {t(dict.calculation.showResults)}
                </Button>
                {isAdaptation(p.status.type) ? <ContinueImprovementModal /> : null}
            </ButtonGroup>
        )
    );
};
