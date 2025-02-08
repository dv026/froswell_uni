import React, { useEffect } from 'react';

import { Box, Button, ButtonGroup, HStack, Progress, ProgressLabel, Text } from '@chakra-ui/react';
import i18n from 'i18next';
import { always, cond, equals, find, isNil, map, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationStepEnum } from '../../../../calculation/entities/computation/calculationBrief';
import {
    ComputationStatus,
    isFinished,
    stoppingByUser
} from '../../../../calculation/entities/computation/computationStatus';
import { computationStatusState } from '../../../../calculation/store/computationStatus';
import { resultsAreAvailable } from '../../../../calculation/store/insimCalcParams';
import { allPlasts } from '../../../../calculation/store/plasts';
import { EmptyData } from '../../../../common/components/emptyData';
import { FormField } from '../../../../common/components/formField';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface CalculationProgressProps {
    toResults: () => void;
    abort: () => void;
}

export const CalculationProgress: React.FC<CalculationProgressProps> = (p: CalculationProgressProps) => {
    const { t } = useTranslation();
    const plasts = useRecoilValue(allPlasts);
    const computationStatus = useRecoilValue(computationStatusState);

    const setHasResults = useSetRecoilState(resultsAreAvailable);

    useEffect(() => {
        return () => {
            setHasResults(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!computationStatus) {
        return <EmptyData text={t(dict.calculation.tipWaitUntilStart)} hideIcon={true} />;
    }

    const totalPercent = computationStatus.percent;

    const calculation = find(x => x.id === computationStatus?.details?.id, computationStatus.calculations);
    const currentStep = calculation ? calculation.currentStep : null;

    return (
        <Box w={'800px'}>
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
                <Text>{getStepNamePrediction(currentStep)}</Text>
            </FormField>
            <FormField title={t(dict.calculation.progressTotal)} ratio={[20, 80]}>
                <Progress
                    m='7px 0'
                    w='100%'
                    size='lg'
                    isAnimated={true}
                    isIndeterminate={totalPercent === 0}
                    value={totalPercent}
                >
                    <ProgressLabel>{totalPercent}%</ProgressLabel>
                </Progress>
            </FormField>
            <FormField title={null} ratio={[20, 80]}>
                <Actions status={computationStatus} toResults={p.toResults} abort={p.abort} />
            </FormField>
        </Box>
    );
};

const getStepNamePrediction = (step: CalculationStepEnum) =>
    cond([
        [equals(CalculationStepEnum.Pending), always(i18n.t(dict.proxy.preparingForCalculation))],
        [equals(CalculationStepEnum.DataLoad), always(i18n.t(dict.proxy.receiveData))],
        [equals(CalculationStepEnum.Calculation), always(i18n.t(dict.common.calc))],
        [equals(CalculationStepEnum.DataSave), always(i18n.t(dict.proxy.savingResults))],
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
        hasResults && (
            <ButtonGroup spacing={2}>
                <Button variant='primary' onClick={p.toResults}>
                    {i18n.t(dict.calculation.showResults)}
                </Button>
            </ButtonGroup>
        )
    );
};
