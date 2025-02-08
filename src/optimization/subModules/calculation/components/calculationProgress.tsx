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
    Flex,
    Heading,
    Progress,
    ProgressLabel,
    Text
} from '@chakra-ui/react';
import i18n from 'i18next';
import { isNil, filter, find, cond, equals, always, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
    CalculationStepEnum,
    isCalculationFinished
} from '../../../../calculation/entities/computation/calculationBrief';
import { CalculationOptDetails } from '../../../../calculation/entities/computation/calculationOptDetails';
import {
    ComputationStatus,
    isFinished,
    isInProgress,
    isNotFinishedCorrectly,
    stoppingByUser
} from '../../../../calculation/entities/computation/computationStatus';
import { computationStatusState } from '../../../../calculation/store/computationStatus';
import { resultsAreAvailable } from '../../../../calculation/store/insimCalcParams';
import { EmptyData } from '../../../../common/components/emptyData';
import { FormField } from '../../../../common/components/formField';
import { limitBottom } from '../../../../common/helpers/math';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface CalculationProgressProps {
    collapsed?: boolean;
    toResults: () => void;
    abort: () => void;
}

export const CalculationProgress: FC<CalculationProgressProps> = (p: CalculationProgressProps) => {
    const { t } = useTranslation();
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

    if (isNil(computationStatus)) {
        return <EmptyData text={t(dict.calculation.tipWaitUntilStart)} hideIcon={true} />;
    }

    const totalPercent = computationStatus.percent;

    const details = computationStatus?.details as unknown as CalculationOptDetails;
    const step = find(x => x.modelId === details?.modelId, computationStatus?.calculations ?? [])?.currentStep;

    // const currentT = details?.currentT;
    // const isLastT = details && details.currentT === details.maxT;

    let finishedCount = filter(isCalculationFinished, computationStatus.calculations ?? []).length;
    let totalCount = computationStatus.calculations.length;

    if (computationStatus.calculations.length > 1) {
        finishedCount = limitBottom(0, finishedCount - 1);
        totalCount = totalCount - 1;
    }

    const progressElement = (
        <ProgressBar totalPercent={totalPercent} step={step} isRunning={isInProgress(computationStatus)} />
    );

    return (
        <Accordion variant='custom' allowToggle index={collapsed} onChange={setCollapsed}>
            <AccordionItem>
                {({ isExpanded }) => (
                    <>
                        <AccordionButton height='42px'>
                            <Flex flex={1} gap={2} textAlign='left' onClick={e => e.stopPropagation()}>
                                <Heading size='h3' flexBasis={'160px'} margin='auto 0'>
                                    {t(dict.proxy.optimization.optimization)}
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
                            <FormField
                                title={i18n.t(dict.proxy.optimization.numberPredictedScenarios)}
                                ratio={[20, 80]}
                            >
                                <Text fontWeight='bold'>
                                    {finishedCount} {t(dict.calculation.from)} {totalCount}
                                </Text>
                            </FormField>
                            {/*<FormField title={t(dict.calculation.stage)} ratio={[20, 80]}>*/}
                            {/*    <Text>{getStepName(step, currentT, isLastT)}</Text>*/}
                            {/*</FormField>*/}
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

interface ActionProps {
    status: ComputationStatus;
    toResults: () => void;
    abort: () => void;
}

const Actions: React.FC<ActionProps> = (p: ActionProps) => {
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
        hasResults &&
        !isNotFinishedCorrectly(p.status) && (
            <ButtonGroup spacing={2}>
                <Button variant='primary' onClick={p.toResults}>
                    {i18n.t(dict.calculation.showResults)}
                </Button>
            </ButtonGroup>
        )
    );
};

interface ProgressBarProps {
    step: CalculationStepEnum;
    totalPercent: number;
    isRunning: boolean;
}

const ProgressBar: FC<ProgressBarProps> = ({ isRunning, step, totalPercent }: ProgressBarProps) => {
    const text = isRunning ? `${totalPercent}%` : getStepName(step);
    return (
        <Progress m='7px 0' w='600px' size='lg' isAnimated={true} isIndeterminate={isRunning} value={totalPercent}>
            <ProgressLabel>{text}</ProgressLabel>
        </Progress>
    );
};

const getStepName = (step: CalculationStepEnum) =>
    cond([
        [equals(CalculationStepEnum.Pending), always(i18n.t(dict.proxy.preparingForCalculation))],
        [equals(CalculationStepEnum.DataLoad), always(i18n.t(dict.proxy.receiveData))],
        [equals(CalculationStepEnum.Calculation), always(i18n.t(dict.proxy.calcOptimization))],
        [equals(CalculationStepEnum.DataSave), always(i18n.t(dict.proxy.saveOptimization))],
        [equals(CalculationStepEnum.Finished), always(`${i18n.t(dict.proxy.completed)}`)],
        [equals(CalculationStepEnum.FinishedWithErrors), always(`${i18n.t(dict.proxy.completedWithErrors)}`)],
        [equals(CalculationStepEnum.StoppedByUser), always(`${i18n.t(dict.proxy.stoppedByUser)}`)],
        [equals(CalculationStepEnum.IsStoppingByUser), always(`${i18n.t(dict.proxy.stoppingByUser)}`)],
        [T, always('...')]
    ])(step);
