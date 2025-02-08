import React, { FC, useState } from 'react';

import { Box, Button, Flex, HStack, Progress, ProgressLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';

import colors from '../../../../../theme/colors';
import { BatchStatus } from '../../../entities/batchStatus';
import { processingFinished, processingInProgress, ProcessingStatusEnum } from '../../../entities/processingStatusEnum';
import { isTruthy, trueOrNull } from '../../../helpers/ramda';
import { cls } from '../../../helpers/styles';
import { ControlWithClassProps } from '../../customControl';

import css from './index.module.less';

import mainDict from '../../../helpers/i18n/dictionary/main.json';

export interface StepProgressProps {
    stepName: string;
    currentNumber: number;
    totalCount: number;
}

interface Props extends ControlWithClassProps {
    abort: () => void;
    forceAbort: () => void;
    title: string;
    mapNames: string[];
    batch: BatchStatus;
    stepProgress?: StepProgressProps;
    goToMap: () => void;
    goToParams: () => void;
}

interface ActionProps extends ControlWithClassProps {
    batch: BatchStatus;
    abortPressed: boolean;
    forceAbortPressed: boolean;
    abort: () => void;
    forceAbort: () => void;
    goToMap: () => void;
}

export const CalculationProgress: FC<Props> = (p: Props) => {
    const { t } = useTranslation();
    const [abortPressed, setAbortPressed] = useState<boolean>(false);
    const [forceAbortPressed, setForceAbortPressed] = useState<boolean>(false);

    if (!p.batch) {
        return null;
    }

    const abortAction = () => {
        setAbortPressed(true);
        p.abort();
    };

    const forceAbortAction = () => {
        setForceAbortPressed(true);
        p.forceAbort();
    };

    const status = <Status percent={p.batch.completePercent} id={p.batch.statusId} abortPressed={abortPressed} />;

    return (
        <div className={cls(css.calc, p.className)}>
            <div className={css.calc__content}>
                <Box>
                    <HStack spacing={4} pb='20px' align='stretch'>
                        {p.title ? (
                            <Box w='238px' color={colors.typo.secondary}>
                                {p.title}:
                            </Box>
                        ) : null}
                        <Box w='100%'>
                            {R.map(
                                x => (
                                    <div key={x} className={css.calc__mapName}>
                                        {x}
                                    </div>
                                ),
                                p.mapNames
                            )}
                        </Box>
                    </HStack>
                    <HStack spacing={4} pb='20px' align='stretch'>
                        <Box w='100%'>
                            <Box className={css.calc__progress} m='7px 0'>
                                <Progress
                                    size='lg'
                                    isAnimated={true}
                                    isIndeterminate={p.batch.completePercent === 0}
                                    value={p.batch.completePercent}
                                >
                                    <ProgressLabel>
                                        {p.batch.statusId === ProcessingStatusEnum.InProgress
                                            ? `${p.batch.completePercent}%`
                                            : status}
                                    </ProgressLabel>
                                </Progress>
                            </Box>
                        </Box>
                    </HStack>
                    <HStack spacing={4} align='stretch'>
                        <Flex width='100%' alignItems='end' direction='column'>
                            <Actions
                                abort={abortAction}
                                forceAbort={forceAbortAction}
                                batch={p.batch}
                                goToMap={p.goToMap}
                                abortPressed={abortPressed}
                                forceAbortPressed={forceAbortPressed}
                            />
                        </Flex>
                    </HStack>
                </Box>
            </div>
            {/* {processingFinished(p.batch.statusId) ? (
                <Crescent className='calc__back' direction={CrescentDirectionEnum.Left} onClick={p.goToParams}>
                    <div className='calc__back-title'>
                        {i18n.t(mainDict.progress.options)}
                        <div>&lt;&lt;</div>
                    </div>
                </Crescent>
            ) : null} */}
        </div>
    );
};

const Actions: FC<ActionProps> = ({ abortPressed, abort, forceAbort, batch, goToMap }: ActionProps) => {
    if (processingFinished(batch.statusId)) {
        return (
            <div className={css.calc__actions}>
                <Button variant='primary' className={css.calc__toMap} onClick={goToMap}>
                    {i18n.t(mainDict.progress.openMap)}
                </Button>
            </div>
        );
    }

    const forceAbortBtn =
        processingInProgress(batch.statusId) && abortPressed ? (
            <Button variant='cancel' className={forceAbortBtnCls()} onClick={abortPressed ? forceAbort : abort}>
                {i18n.t(mainDict.progress.forcedCancellation)}
            </Button>
        ) : null;

    const abortBtn =
        processingInProgress(batch.statusId) && !abortPressed ? (
            <Button variant='cancel' className={abortBtnCls(abortPressed)} onClick={abortPressed ? forceAbort : abort}>
                {abortPressed ? i18n.t(mainDict.progress.forcedCancellation) : i18n.t(mainDict.progress.abort)}
            </Button>
        ) : null;

    return (
        <div className={css.calc__actions}>
            {abortBtn}
            {forceAbortBtn}
        </div>
    );
};

const abortBtnCls = (abortPressed: boolean) => cls(css.calc__stop, trueOrNull(abortPressed, css.calc__stopForced));

const forceAbortBtnCls = () => cls(css.calc__stop, css.calc__stopForced);

interface StatusProps {
    abortPressed: boolean;
    id: ProcessingStatusEnum;
    percent: number;
}

const Status: React.FC<StatusProps> = ({ abortPressed, id }: StatusProps) => {
    const text = R.cond([
        [R.equals(ProcessingStatusEnum.Pending), R.always(i18n.t(mainDict.progress.requestInQueue))],
        [
            x => isTruthy(abortPressed) && R.equals(ProcessingStatusEnum.InProgress, x),
            R.always(i18n.t(mainDict.progress.cancelingOperation))
        ],
        [R.equals(ProcessingStatusEnum.Finished), R.always(i18n.t(mainDict.proxy.completed))],
        [R.equals(ProcessingStatusEnum.FinishedWithErrors), R.always(i18n.t(mainDict.proxy.completedWithErrors))],
        [R.equals(ProcessingStatusEnum.Aborted), R.always(i18n.t(mainDict.progress.interruptedByUser))],
        [R.T, R.always('')]
    ])(id);

    return (
        <div>
            <span className={css.calc__nowName}>{text}</span>
        </div>
    );
};

const StepProgress: React.FC<Props> = ({ stepProgress, batch }: Props) => {
    if (R.isNil(stepProgress) || batch.statusId !== ProcessingStatusEnum.InProgress) {
        return null;
    }

    const progressLabel =
        stepProgress.currentNumber || stepProgress.totalCount
            ? `${stepProgress.currentNumber}/${stepProgress.totalCount}`
            : null;

    return (
        <div className={css.step__progress}>
            <div className={css.calc__mapName}>
                <strong>{stepProgress.stepName}</strong>
            </div>
            <div className={css.calc__progress}>
                <div className={css.step__container}>
                    <div className={css.step__item}>
                        <Progress
                            size='md'
                            isAnimated={true}
                            value={(stepProgress.currentNumber / stepProgress.totalCount) * 100}
                        >
                            <ProgressLabel>{progressLabel}</ProgressLabel>
                        </Progress>
                    </div>
                </div>
            </div>
        </div>
    );
};
