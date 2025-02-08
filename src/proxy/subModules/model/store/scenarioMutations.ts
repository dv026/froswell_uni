import { filter, head, isNil } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { ScenarioModel, sortScenariosById } from '../../../../calculation/entities/scenarioModel';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { initialSettings } from '../../../../calculation/store/initialSettings';
import { scenariosState } from '../../../../calculation/store/scenarios';
import { ProcessingStatusEnum } from '../../../../common/entities/processingStatusEnum';
import { WithValidation } from '../../../../common/gateway';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { wellListState as optimizationWellListState } from '../../../../optimization/store/wellList';
import { wellListState as predictionWellListState } from '../../../../prediction/store/wellList';
import { CalculationSettingsModel } from '../../../entities/proxyMap/calculationSettingsModel';
import {
    abortScenarioCalculation,
    addNewScenario,
    checkScenarioBatchStatus,
    deleteScenario,
    favoriteScenario,
    renameScenario,
    startScenarioCalculationBatch
} from '../../../gateways/wellGrid/gateway';
import { currentSpot } from '../../../store/well';
import { wellListState as proxyWellListState } from '../../../store/wellList';
import { batchStatusState } from './batchStatus';

export const isLoadingState = atom<boolean>({
    key: 'proxyMapScenario__isLoadingState',
    default: false
});

export function useScenarioMutations() {
    const refreshScenarios = useRecoilCallback(({ refresh }) => async () => {
        refresh(scenariosState);
    });

    const copyItem = useRecoilCallback(
        ({ snapshot, set, refresh }) =>
            async (id: number, calcState: boolean = false) => {
                const well = await snapshot.getPromise(currentSpot);

                set(isLoadingState, true);

                const { data: scenariosResponse } = await addNewScenario(
                    new ScenarioModel(id, '', well.prodObjId, '', [], false, calcState)
                );
                const response = scenariosResponse as WithValidation<ScenarioModel>;

                set(currentScenarioId, response.payload.id);

                set(isLoadingState, false);

                if (calcState) {
                    refresh(initialSettings);
                }

                refreshScenarios();
            }
    );

    const addItem = useRecoilCallback(() => async () => {
        copyItem(0);
    });

    const renameItem = useRecoilCallback(({ snapshot }) => async (name: string) => {
        const scenarioId = await snapshot.getPromise(currentScenarioId);

        const response = await renameScenario(new ScenarioModel(scenarioId, name));

        if (isNullOrEmpty(response.data.errors)) {
            refreshScenarios();
            refreshWellList();
        }
    });

    const favoriteItem = useRecoilCallback(() => async (id: number) => {
        const response = await favoriteScenario(id);

        refreshScenarios();

        if (isNullOrEmpty(response.data.errors)) {
            refreshWellList();
        }
    });

    const deleteItem = useRecoilCallback(({ snapshot, set }) => async () => {
        const scenarioId = await snapshot.getPromise(currentScenarioId);
        const scenarios = await snapshot.getPromise(scenariosState);

        set(isLoadingState, true);

        await deleteScenario(scenarioId);

        const withoutRemoved = sortScenariosById(filter(it => it.id !== scenarioId, scenarios));

        set(currentScenarioId, head(withoutRemoved)?.id);

        set(isLoadingState, false);

        refreshWellList();

        refreshScenarios();
    });

    const refreshWellList = useRecoilCallback(({ refresh }) => async () => {
        // обновление списков скважин
        refresh(proxyWellListState);
        refresh(predictionWellListState);
        refresh(optimizationWellListState);
    });

    const checkStatus = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await checkScenarioBatchStatus(batchStatus.id);

        set(batchStatusState, response.data);
    });

    const startCalculation = useRecoilCallback(({ set }) => async (model: CalculationSettingsModel) => {
        if (isNil(model)) {
            return;
        }

        const response = await startScenarioCalculationBatch(model);

        set(batchStatusState, response.data);
    });

    const abortCalculation = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const response = await abortScenarioCalculation(batchStatus.id);

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
    });

    return {
        abortCalculation,
        addItem,
        checkStatus,
        clearBatchStatus,
        copyItem,
        deleteItem,
        favoriteItem,
        refreshScenarios,
        renameItem,
        startCalculation
    };
}
