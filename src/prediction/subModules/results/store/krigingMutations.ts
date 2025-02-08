import { includes } from 'ramda';
import { useRecoilCallback } from 'recoil';

import { CalculationModeEnum, isOptimization, isPrediction } from '../../../../calculation/enums/calculationModeEnum';
import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { toArray } from '../../../../common/entities/gridAvailability';
import { ProcessingStatusEnum } from '../../../../common/entities/processingStatusEnum';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { shallow } from '../../../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../../../input/entities/krigingCalcSettings';
import { getAvailableGrids as getOptimizationAvailableGrids } from '../../../../optimization/subModules/results/gateways/gateway';
import { availableGridsSelector as optimizationAvailableGrids } from '../../../../optimization/subModules/results/store/mapSettings';
import { availableGridsSelector as proxyAvailableGrids } from '../../../../proxy/subModules/results/store/mapSettings';
import { currentSpot } from '../../../store/well';
import { getAvailableGrids as getPredictionAvailableGrids } from '../gateways/gateway';
import { abortKriging, calcKriging, checkBatchStatus } from '../gateways/krigingGateway';
import { batchStatusState } from './batchStatus';
import { availableGridsSelector as predictionAvailableGrids } from './mapSettings';

export function useKrigingMutations() {
    const check = useRecoilCallback(({ snapshot, set }) => async () => {
        const status = await snapshot.getPromise(batchStatusState);

        if (!status) {
            return;
        }

        const { data: response, error } = await checkBatchStatus(status.id);

        if (!error) {
            set(batchStatusState, response);
        }
    });

    const start = useRecoilCallback(({ snapshot, set }) => async (model: KrigingCalcSettingsModel) => {
        const well = await snapshot.getPromise(currentSpot);

        const { data: response, error } = await calcKriging(
            shallow(model, {
                allowNegative: includes(GridMapEnum.SkinFactor, model.params)
            }),
            well.scenarioId,
            well.subScenarioId
        );

        if (!error) {
            set(batchStatusState, response);
        }
    });

    const abort = useRecoilCallback(({ snapshot, set }) => async () => {
        const status = await snapshot.getPromise(batchStatusState);

        if (!status) {
            return;
        }

        const { data: response, error } = await abortKriging(status.id);

        if (!error && response) {
            set(batchStatusState, null);
        }
    });

    const clear = useRecoilCallback(({ snapshot, set }) => async (setAborted: boolean) => {
        const status = await snapshot.getPromise(batchStatusState);

        if (setAborted) {
            set(batchStatusState, shallow(status, { statusId: ProcessingStatusEnum.Aborted }));
        } else {
            set(batchStatusState, null);
        }
    });

    const loadAvailableGrids = useRecoilCallback(({ snapshot, set }) => async (mode: CalculationModeEnum) => {
        const well = await snapshot.getPromise(currentSpot);
        const plastId = await snapshot.getPromise(currentPlastId);

        if (isOptimization(mode)) {
            const response = await getOptimizationAvailableGrids(well.prodObjId, plastId, well.scenarioId);

            set(optimizationAvailableGrids, toArray<GridMapEnum>(response.data));
        } else if (isPrediction(mode)) {
            const response = await getPredictionAvailableGrids(well.prodObjId, plastId, well.scenarioId);

            set(predictionAvailableGrids, toArray<GridMapEnum>(response.data));
        } else {
            const response = await getPredictionAvailableGrids(well.prodObjId, plastId, well.scenarioId);

            set(proxyAvailableGrids, toArray<GridMapEnum>(response.data));
        }
    });

    return {
        check,
        start,
        abort,
        clear,
        loadAvailableGrids
    };
}
