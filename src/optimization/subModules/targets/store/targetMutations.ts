import { filter, map } from 'ramda';
import { useRecoilCallback } from 'recoil';

import { insimCalcParams } from '../../../../calculation/store/insimCalcParams';
import { addDay, addMonth, datesDiff, firstDay } from '../../../../common/helpers/date';
import { max, min, round0 } from '../../../../common/helpers/math';
import { currentSpot } from '../../../store/well';
import { optimizationWellsNumbers } from '../../wellGroup/store/optimizationWells';
import { ChartModel } from '../entities/chartModel';
import { SettingsModel } from '../entities/settingsModel';
import { TargetOptionModel } from '../entities/targetOptionModel';
import { createTargetZone, removeTargetZone, requestTargetZones, updateTargetZone } from '../gateways/gateway';
import { currentPlastIdState } from './currentPlast';
import { isLoadingState } from './isLoading';
import { moduleState } from './moduleState';
import { settingsState } from './settings';

export function useTargetMutations() {
    const load = useRecoilCallback(({ snapshot, set }) => async () => {
        const filteredWells = await snapshot.getPromise(optimizationWellsNumbers);
        const plastId = await snapshot.getPromise(currentPlastIdState);
        const well = await snapshot.getPromise(currentSpot);

        const { data: response } = await requestTargetZones(well, plastId, filteredWells);

        set(moduleState, { chartData: response.chartData, targetZones: response.targetZones });
    });

    const create = useRecoilCallback(({ snapshot, set }) => async (type: number) => {
        const module = await snapshot.getPromise(moduleState);
        const params = await snapshot.getPromise(insimCalcParams);
        const plastId = await snapshot.getPromise(currentPlastIdState);
        const settings = await snapshot.getPromise(settingsState);
        const well = await snapshot.getPromise(currentSpot);

        set(isLoadingState, true);

        const rangeXFull = xRange(module.chartData, settings, params.adaptationEnd, params.forecastEnd);
        const rangeX = xRangeByType(module.chartData, params.forecastEnd);
        const rangeY = yRangeByType(module.chartData, type);

        await createTargetZone({
            id: 0,
            scenarioId: well.scenarioId,
            subScenarioId: well.subScenarioId,
            plastId: plastId,
            wellId: well.id,
            type: type,
            minDate: firstDay(type === 1 ? rangeX[0] : rangeXFull[0]),
            maxDate: firstDay(type === 1 ? rangeX[1] : rangeXFull[1]),
            minValue: type === 1 ? rangeY[0] : 0,
            maxValue: rangeY[1]
        });

        await load();

        set(isLoadingState, false);
    });

    const update = useRecoilCallback(() => async (model: TargetOptionModel) => {
        await updateTargetZone(model);

        load();
    });

    const remove = useRecoilCallback(({ set }) => async (model: TargetOptionModel) => {
        set(isLoadingState, true);

        await removeTargetZone(model);

        await load();

        set(isLoadingState, false);
    });

    return {
        create,
        update,
        remove
    };
}

const dataOnlyReal = (data: ChartModel[]) => filter((x: ChartModel) => x.isReal, data);

export const xRange = (data: ChartModel[], settings: SettingsModel, startDate: Date, endDate: Date): [Date, Date] => {
    const x1 = new Date(
        Math.min(addMonth(new Date(), -1).getTime(), min(map(it => new Date(it.dt).getTime(), dataOnlyReal(data))))
    );

    const diff = datesDiff(startDate, endDate);
    const diffAll = datesDiff(x1, endDate);

    const shift = Math.max(diff * 3, (diffAll * (100 - settings.horizon + 1)) / 100);

    return [new Date(Math.max(addDay(endDate, -shift).getTime(), x1.getTime())), endDate];
};

export const xRangeByType = (data: ChartModel[], endDate: Date): [Date, Date] => {
    const x2 = new Date(
        Math.max(addMonth(new Date(), -1).getTime(), max(map(it => new Date(it.dt).getTime(), dataOnlyReal(data))))
    );

    return [x2, endDate];
};

export const yRangeByType = (data: ChartModel[], type: number): [number, number] => {
    const values = map(it => (type === 1 ? it.oilRate : type === 2 ? it.liqRate : it.injection), data);
    const y1 = Math.max(0, min(values));
    const y2 = Math.max(10, max(values));
    const diff = Math.abs(y2 - y1);
    const rect = diff / 4;

    return [round0(y2 - rect), round0(y2 + rect)];
};
