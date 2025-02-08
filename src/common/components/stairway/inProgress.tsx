import React, { useEffect, useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Center,
    Flex,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr
} from '@chakra-ui/react';
import { ActiveCalculationsListener } from 'calculation/entities/activeCalculationsListener';
import { getActiveComputations } from 'calculation/gateways/gateway';
import { activeComputationsState } from 'calculation/store/activeComputations';
import { RouteEnum } from 'common/enums/routeEnum';
import i18n from 'i18next';
import { makeCalculationQuery } from 'proxy/subModules/calculation/utils';
import { always, cond, equals, map, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import colors from '../../../../theme/colors';
import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { cls } from '../../helpers/styles';
import { InProcessIcon } from '../customIcon/navigation';

import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

export const InProgress = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [activeComputations, setActiveComputations] = useRecoilState(activeComputationsState);

    const open = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    const countTasks = !!activeComputations ? activeComputations.length : 0;
    const disabled = !countTasks;

    useEffect(() => {
        const calcListener = new ActiveCalculationsListener();
        calcListener.start(async () => {
            const { data } = await getActiveComputations();
            setActiveComputations(data);
        });

        return () => calcListener.stop();
    }, []);

    const openHandler = (key: string, type: CalculationModeEnum) => {
        navigate({
            pathname: getRouteToCalculation(type),
            search: makeCalculationQuery(key)
        });

        close();
    };

    const removeAllHandler = () => {
        // dispatcher?.removeAllTasks();

        close();
    };

    // const abortHandler = (task: InsimTaskModel) => {
    //     insimDispatcher?.removeTask(task.key);

    //     close();
    // };

    return (
        <>
            <Popover
                closeOnBlur={true}
                isLazy={true}
                returnFocusOnClose={true}
                isOpen={isOpen}
                onClose={close}
                placement='right'
            >
                <PopoverTrigger>
                    <Flex
                        className={cls(css.stairway__step, disabled ? css.stairway__step_disabled : '')}
                        onClick={open}
                    >
                        <InProcessIcon boxSize={9} />
                        {countTasks ? <span className={css.counter}>{countTasks}</span> : null}
                        <span>{t(dict.common.calc)}</span>
                    </Flex>
                </PopoverTrigger>
                {countTasks ? (
                    <PopoverContent width='100%' textColor={colors.typo.primary}>
                        <PopoverArrow />
                        <PopoverBody>
                            <Table variant={'simple'} size={'sm'}>
                                <Thead>
                                    <Tr>
                                        <Th>{t(dict.calculation.status)}</Th>
                                        <Th>{t(dict.common.type)}</Th>
                                        <Th>{t(dict.common.object)}</Th>
                                        <Th>{t(dict.progress.actions)}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {map(
                                        it => (
                                            <Tr key={`${it.key}`}>
                                                <Td>{rowIcon(it.percent, it.isFinished)}</Td>
                                                <Td>{rowType(it.type)}</Td>
                                                <Td>
                                                    <Breadcrumb>
                                                        <BreadcrumbItem key={it.oilfieldName}>
                                                            <BreadcrumbLink>{it.oilfieldName}</BreadcrumbLink>
                                                        </BreadcrumbItem>
                                                        <BreadcrumbItem key={it.productionObjectName}>
                                                            <BreadcrumbLink>{it.productionObjectName}</BreadcrumbLink>
                                                        </BreadcrumbItem>
                                                        <BreadcrumbItem key={it.scenarioName ?? it.subScenarioName}>
                                                            <BreadcrumbLink>
                                                                {it.scenarioName ?? it.subScenarioName}
                                                            </BreadcrumbLink>
                                                        </BreadcrumbItem>
                                                    </Breadcrumb>
                                                </Td>
                                                <Td>
                                                    <ButtonGroup size='sm' variant='link'>
                                                        <Button onClick={() => openHandler(it.key, it.type)}>
                                                            {t(dict.common.open)}
                                                        </Button>
                                                        {/* <Button onClick={() => abortHandler(it)}>
                                                            {t(dict.progress.abort)}
                                                        </Button> */}
                                                    </ButtonGroup>
                                                </Td>
                                            </Tr>
                                        ),
                                        activeComputations
                                    )}
                                </Tbody>
                            </Table>
                            <ButtonGroup size='sm' variant='link' mt={2}>
                                <Button onClick={removeAllHandler}>{t(dict.progress.deleteAllTasks)}</Button>
                            </ButtonGroup>
                        </PopoverBody>
                        {/* <PopoverCloseButton /> */}
                    </PopoverContent>
                ) : (
                    <PopoverContent width='auto' textColor={colors.typo.primary}>
                        <PopoverArrow />
                        <PopoverBody>{t(dict.progress.noRunningCalculations)}</PopoverBody>
                    </PopoverContent>
                )}
            </Popover>
        </>
    );
};

const rowIcon = (percent: number, isFinished: boolean) => {
    // const result = cond([
    //     [
    //         isInProgress,
    //         always(
    //             <Center>
    //                 <Spinner size={'sm'} mr={2} />
    //                 {percent}%
    //             </Center>
    //         )
    //     ]
    //     // [isStartedProgress, always(<MoreIcon boxSize={6} />)],
    //     // [isFinished, always(<CompleteIcon boxSize={6} color={colors.colors.green} />)],
    //     // [isNotFinishedCorrectly, always(<ErrorIcon boxSize={6} color={colors.colors.red} />)],
    //     // [stoppingByUser, always(<MoreIcon boxSize={6} />)],
    //     // [stoppedByUser, always(<ErrorIcon boxSize={6} />)],
    //     // [T, always(null)]
    // ])(currentStep);
    //
    // return result;
    return (
        <Center>
            <Spinner size={'sm'} mr={2} />
            {percent}%
        </Center>
    );
};

const rowType = (type: number) =>
    cond([
        [equals(CalculationModeEnum.Creation), always(i18n.t(dict.proxy.preparation.creating))],
        [equals(CalculationModeEnum.Improvement), always(i18n.t(dict.proxy.preparation.improvement))],
        [equals(CalculationModeEnum.Prediction), always(i18n.t(dict.proxy.forecast))],
        [equals(CalculationModeEnum.Optimization), always(i18n.t(dict.proxy.optimization.optimization))],
        [T, always(null)]
    ])(type);

const getRouteToCalculation = (type: CalculationModeEnum) =>
    cond([
        [equals(CalculationModeEnum.Creation), always(RouteEnum.ProxyCalculation)],
        [equals(CalculationModeEnum.Improvement), always(RouteEnum.ProxyCalculation)],
        [equals(CalculationModeEnum.Prediction), always(RouteEnum.PredictionCalculation)],
        [equals(CalculationModeEnum.Optimization), always(RouteEnum.OptimizationCalculation)],
        [T, always(null)]
    ])(type);
