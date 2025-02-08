import i18n from 'i18next';
import { head, isNil } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { scenariosState } from '../../../../calculation/store/scenarios';
import { ProcessingStatusEnum } from '../../../../common/entities/processingStatusEnum';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { wellListState as optimizationWellListState } from '../../../../optimization/store/wellList';
import { wellListState as predictionWellListState } from '../../../../prediction/store/wellList';
import { CalculationSubScenariosModel } from '../../../../proxy/entities/proxyMap/calculationSubScenariosModel';
import { ImprovementModel } from '../../../../proxy/entities/proxyMap/improvementModel';
import { SubScenarioModel } from '../../../../proxy/entities/proxyMap/subScenarioModel';
import { wellListState as proxyWellListState } from '../../../../proxy/store/wellList';
import {
    abortImprovementBatch,
    abortSubScenarioCalculation,
    addSubScenario,
    checkImprovementBatchStatus,
    checkSubScenarioBatchStatus,
    copySubScenario,
    editSubScenario,
    removeSubScenario,
    startImprovementBatch,
    startSubScenarioCalculationBatch
} from '../gateways/gateway';
import { batchStatusState } from './batchStatus';
import { allSubScenarios } from './subScenarios';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const isLoadingState = atom<boolean>({
    key: 'predictionMapScenario__isLoadingState',
    default: false
});

export const useSubScenarioMutations = () => {
    const refreshScenarios = useRecoilCallback(({ refresh }) => async () => {
        refresh(scenariosState);
        // refresh(allSubScenarios);

        refresh(proxyWellListState);
        refresh(predictionWellListState);
        refresh(optimizationWellListState);
    });

    const copyItem = useRecoilCallback(({ snapshot, set }) => async (sourceId: number) => {
        const scenarioId = await snapshot.getPromise(currentScenarioId);

        const newSubScenario = new SubScenarioModel(sourceId, i18n.t(dict.common.subScenario), scenarioId);

        set(isLoadingState, true);

        const { data: newId, error } = !!sourceId
            ? await copySubScenario(newSubScenario)
            : await addSubScenario(newSubScenario);

        if (!!error) {
            return;
        }

        newSubScenario.id = +newId;

        set(currentSubScenarioId, newId);

        set(isLoadingState, false);

        refreshScenarios();
    });

    const addItem = useRecoilCallback(() => async () => {
        copyItem(0);
    });

    const renameItem = useRecoilCallback(({ snapshot }) => async (name: string) => {
        const scenarioId = await snapshot.getPromise(currentScenarioId);
        const subScenarioId = await snapshot.getPromise(currentSubScenarioId);

        const response = await editSubScenario(new SubScenarioModel(subScenarioId, name, scenarioId));

        if (isNullOrEmpty(response.data.errors)) {
            refreshScenarios();
        }
    });

    const deleteItem = useRecoilCallback(({ snapshot, set }) => async () => {
        const subScenarioId = await snapshot.getPromise(currentSubScenarioId);
        const subScenarios = await snapshot.getPromise(allSubScenarios);

        set(isLoadingState, true);

        const { error } = await removeSubScenario(subScenarioId);

        if (error) {
            return;
        }

        set(currentSubScenarioId, head(subScenarios)?.id);

        set(isLoadingState, false);

        refreshScenarios();
    });

    const checkStatus = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await checkSubScenarioBatchStatus(batchStatus.id);

        set(batchStatusState, response.data);
    });

    const startCalculation = useRecoilCallback(({ set }) => async (model: CalculationSubScenariosModel) => {
        if (isNil(model)) {
            return;
        }

        const response = await startSubScenarioCalculationBatch(model);

        set(batchStatusState, response.data);
    });

    const abortCalculation = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await abortSubScenarioCalculation(batchStatus.id);

        if (response.data) {
            set(batchStatusState, null);
        }
    });

    const clearBatchStatus = useRecoilCallback(({ snapshot, set }) => async (setAborted: boolean) => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (setAborted) {
            set(batchStatusState, shallow(batchStatus, { statusId: ProcessingStatusEnum.Aborted }));
        } else {
            set(batchStatusState, null);
        }

        refreshScenarios();
    });

    const checkImprovementStatus = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await checkImprovementBatchStatus(batchStatus.id);

        set(batchStatusState, response.data);
    });

    const startImprovementCalculation = useRecoilCallback(({ set }) => async (model: ImprovementModel) => {
        if (isNil(model)) {
            return;
        }

        const response = await startImprovementBatch(model);

        set(batchStatusState, response.data);
    });

    const abortImprovementCalculation = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await abortImprovementBatch(batchStatus.id);

        if (response.data) {
            set(batchStatusState, null);
        }
    });

    return {
        addItem,
        copyItem,
        renameItem,
        deleteItem,
        checkStatus,
        startCalculation,
        abortCalculation,
        clearBatchStatus,
        checkImprovementStatus,
        startImprovementCalculation,
        abortImprovementCalculation
    };
};

// const subScenariosForScenario = (scenarioId: number, scenarios: ScenarioModel[]) =>
//     find<ScenarioModel>(propEq('id', scenarioId), scenarios).subScenarios;

// const addSubToScenarios = (scenarioId: number, newSubScenario: SubScenarioModel, scenarios: ScenarioModel[]) =>
//     map(
//         when(
//             propEq<ScenarioModel>('id', scenarioId),
//             assoc('subScenarios', append(newSubScenario, subScenariosForScenario(scenarioId, scenarios)))
//         ),
//         scenarios
//     );
