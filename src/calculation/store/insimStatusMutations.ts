import { append, assoc, curry, head, isNil, map, propEq, reject, when } from 'ramda';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { isNullOrEmpty } from '../../common/helpers/ramda';
import { DirectedStageEnum as OptimizationDirectedStageEnum } from '../../optimization/enums/directedStageEnum';
import { currentStepState as optimizationCurrentStep } from '../../optimization/store/currentStep';
import { currentWellNames as optimizationCurrentWellNames } from '../../optimization/store/well';
import { wellListState as optimizationWellListState } from '../../optimization/store/wellList';
import { DirectedStageEnum as PredictionDirectedStageEnum } from '../../prediction/enums/directedStageEnum';
import { currentStepState as predictionCurrentStep } from '../../prediction/store/currentStep';
import { currentWellNames as predictionCurrentWellNames } from '../../prediction/store/well';
import { wellListState as predictionWellListState } from '../../prediction/store/wellList';
import { DirectedStageEnum as ProxyDirectedStageEnum } from '../../proxy/enums/directedStageEnum';
import { currentStep as proxyCurrentStep } from '../../proxy/store/currentStep';
import { currentWellNames as proxyCurrentWellNames } from '../../proxy/store/well';
import { wellListState as proxyWellListState } from '../../proxy/store/wellList';
import { ComputationStatus, isFinished } from '../entities/computation/computationStatus';
import { InsimTaskModel } from '../entities/insimTaskModel';
import { CalculationModeEnum } from '../enums/calculationModeEnum';
import { abortInsim, checkInsimBatchStatus } from '../gateways/gateway';
import { computationStatusState } from './computationStatus';
import { initialSettings } from './initialSettings';
import { modeParamsState, resultsAreAvailable } from './insimCalcParams';
import { taskStorageInProgress, taskStorageState } from './taskStorage';
import { userWell } from './userWell';

export function useInsimStatusMutations() {
    const navigate = useNavigate();

    const checkStatus = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(computationStatusState);
        const tasks = await snapshot.getPromise(taskStorageInProgress);

        const task = head(tasks);
        if (isNil(task?.status)) {
            return;
        }

        const response = await checkInsimBatchStatus(task.key);

        if (batchStatus?.key === response.data.key) {
            set(computationStatusState, response.data);
        }

        updateTask(response.data);
    });

    const addTask = useRecoilCallback(({ snapshot, set, refresh }) => async (status: ComputationStatus) => {
        if (isNil(status)) {
            return;
        }

        const tasks = await snapshot.getPromise(taskStorageInProgress);
        const well = await snapshot.getPromise(userWell);

        let names = [];

        if (status.type === CalculationModeEnum.Creation || status.type === CalculationModeEnum.Improvement) {
            names = await snapshot.getPromise(proxyCurrentWellNames);
        }

        if (status.type === CalculationModeEnum.Prediction) {
            names = await snapshot.getPromise(predictionCurrentWellNames);
        }

        if (status.type === CalculationModeEnum.Optimization) {
            names = await snapshot.getPromise(optimizationCurrentWellNames);
        }

        const tinyNames = map(it => it.name, names);
        const url = window.location.pathname + window.location.search;

        const newList = append(new InsimTaskModel(status.key, status, well, tinyNames, url), tasks);

        set(taskStorageState, newList);

        refresh(taskStorageInProgress);
    });

    const updateTask = useRecoilCallback(({ snapshot, set, reset, refresh }) => async (status: ComputationStatus) => {
        if (isNil(status)) {
            return;
        }

        if (isFinished(status)) {
            // обновление списков скважин
            refresh(proxyWellListState);
            refresh(predictionWellListState);
            refresh(optimizationWellListState);

            refresh(initialSettings);

            reset(modeParamsState);

            set(resultsAreAvailable, true);

            await removeTask(status.key);

            return;
        }

        const tasks = await snapshot.getPromise(taskStorageState);

        const newList = alter(status, status.key, tasks);

        set(taskStorageState, newList);
    });

    const removeTask = useRecoilCallback(({ snapshot, set, reset }) => async (key: string) => {
        const tasks = await snapshot.getPromise(taskStorageState);

        const newList = reject((it: InsimTaskModel) => it.key === key, tasks);

        if (isNullOrEmpty(newList)) {
            reset(taskStorageState);
        } else {
            set(taskStorageState, newList);
        }
    });

    const removeAllTasks = useRecoilCallback(({ reset }) => async () => {
        await abort();

        reset(taskStorageState);
    });

    const abort = useRecoilCallback(({ snapshot }) => async () => {
        const batchStatus = await snapshot.getPromise(computationStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await abortInsim(batchStatus.key);

        updateTask(response.data);
    });

    const goToCalculation = useRecoilCallback(({ set }) => async (task: InsimTaskModel) => {
        if (!task || !task.status) {
            return;
        }

        // Перейти на страницу расчета
        navigate(task.url);

        if (task.status.type === CalculationModeEnum.Creation || task.status.type === CalculationModeEnum.Improvement) {
            set(proxyCurrentStep, ProxyDirectedStageEnum.Calculation);
        }

        if (task.status.type === CalculationModeEnum.Prediction) {
            set(predictionCurrentStep, PredictionDirectedStageEnum.Calculation);
        }

        if (task.status.type === CalculationModeEnum.Optimization) {
            set(optimizationCurrentStep, OptimizationDirectedStageEnum.Calculation);
        }

        set(computationStatusState, task.status);
        set(userWell, task.well);
    });

    return {
        addTask,
        checkStatus,
        removeAllTasks,
        goToCalculation
    };
}

const alter = curry((status, key, items) => map(when(propEq('key', key), assoc('status', status)), items));
