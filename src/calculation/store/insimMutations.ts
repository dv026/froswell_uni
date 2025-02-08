import { createStandaloneToast } from '@chakra-ui/toast';
import { AxiosError } from 'axios';
import { RouteEnum } from 'common/enums/routeEnum';
import { uid } from 'common/helpers/strings';
import { t } from 'i18next';
import { makeCalculationQuery } from 'proxy/subModules/calculation/utils';
import { always, cond, equals, filter, isNil, pathOr, pipe, pluck, T } from 'ramda';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { optimizationWellsState } from '../../optimization/subModules/wellGroup/store/optimizationWells';
import { WellGroupItem } from '../entities/wellGroupItem';
import { CalculationModeEnum } from '../enums/calculationModeEnum';
import { abortInsim, runInsim, runOptimization } from '../gateways/gateway';
import { computationStatusState } from './computationStatus';
import { currentScenarioId } from './currentScenarioId';
import { currentSubScenarioId } from './currentSubScenarioId';
import { insimCalcParams } from './insimCalcParams';
import { userWell } from './userWell';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

const { toast } = createStandaloneToast();

export function useInsimMutations() {
    const navigate = useNavigate();

    const start = useRecoilCallback(({ snapshot, set }) => async (mode: CalculationModeEnum) => {
        const scenarioId = await snapshot.getPromise(currentScenarioId);
        const subScenarioId = await snapshot.getPromise(currentSubScenarioId);
        const params = await snapshot.getPromise(insimCalcParams);
        const well = await snapshot.getPromise(userWell);

        const response = await runInsim(
            params,
            mode,
            [scenarioId, subScenarioId],
            well.oilFieldId,
            well.prodObjId,
            handleError
        );

        if (!!response && response.error === 409) {
            return;
        }

        navigate({
            pathname:
                mode === CalculationModeEnum.Prediction ? RouteEnum.PredictionCalculation : RouteEnum.ProxyCalculation,
            search: makeCalculationQuery(response.data as unknown as string) // TODO: исправить типизацию ответа сервера
        });
    });

    const startAdaptation = useRecoilCallback(() => async (mode: CalculationModeEnum) => {
        start(mode);
    });

    const startAdaptationImprovement = useRecoilCallback(() => async () => {
        start(CalculationModeEnum.Improvement);
    });

    const startPrediction = useRecoilCallback(() => async () => {
        start(CalculationModeEnum.Prediction);
    });

    const startOptimization = useRecoilCallback(({ snapshot, set }) => async () => {
        const optimizationWells = await snapshot.getPromise(optimizationWellsState);
        const params = await snapshot.getPromise(insimCalcParams);
        const scenarioId = await snapshot.getPromise(currentScenarioId);
        const subScenarioId = await snapshot.getPromise(currentSubScenarioId);
        const well = await snapshot.getPromise(userWell);

        const excludedWells = pipe(
            filter((x: WellGroupItem) => !x.selected),
            (x: WellGroupItem[]) => pluck('id', x)
        )(optimizationWells ?? []);

        const response = await runOptimization(
            params,
            CalculationModeEnum.Optimization,
            [scenarioId, subScenarioId],
            well.oilFieldId,
            well.prodObjId,
            excludedWells,
            handleError
        );

        if (!!response && response.error === 409) {
            return;
        }

        navigate({
            pathname: RouteEnum.OptimizationCalculation,
            search: makeCalculationQuery(response.data as unknown as string) // TODO: исправить типизацию ответа сервера
        });
    });

    const abort = useRecoilCallback(({ snapshot, set }) => async () => {
        const batchStatus = await snapshot.getPromise(computationStatusState);

        if (isNil(batchStatus)) {
            return;
        }

        const { data: status } = await abortInsim(batchStatus.key);

        if (status) {
            set(computationStatusState, status);
        }
    });

    return {
        abort,
        startAdaptation,
        startAdaptationImprovement,
        startOptimization,
        startPrediction
    };
}

const handleError = async (error: AxiosError) => {
    const status = +pathOr(500, ['response', 'status'], error);
    const errorType = +pathOr(0, ['response', 'data', 'type'], error);

    if (status === 409) {
        toast({
            id: uid(),
            title: t(mainDict.calculation.exceptions.titleCantBeStarted),
            description: getErrorDescription(errorType),
            duration: null,
            status: 'error',
            isClosable: true
        });
    }

    return { error: error?.response?.status, data: null };
};

const getErrorDescription = cond([
    [equals(1), always(t(mainDict.calculation.exceptions.alreadyStarted))],
    [equals(2), always(t(mainDict.calculation.exceptions.exceedLimit))],
    [T, always('')]
]);
