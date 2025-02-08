import { PlastModel } from 'common/entities/plastModel';
import {
    any,
    append,
    equals,
    filter,
    find,
    isNil,
    KeyValuePair,
    map,
    pipe,
    pluck,
    prop,
    propEq,
    reduce,
    reject,
    sortBy,
    uniq
} from 'ramda';
import { selector } from 'recoil';

import { PlastDetail, PlastDistributionModel } from '../../../../calculation/entities/plastDistributionModel';
import { ReserveDevelopmentWrapper } from '../../../../calculation/entities/reserveDevelopmentWrapper';
import { DataModelType } from '../../../../calculation/enums/dataModelType';
import { createRGBAPalette } from '../../../../common/components/charts/helpers';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { shapeRaw } from '../../../../common/gateway';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { Nullable } from '../../../../common/helpers/types';
import { ChartType } from '../../../../prediction/subModules/results/enums/chartType';
import { getReserveDevelopment } from '../../../../prediction/subModules/results/gateways/gateway';
import { currentPlastId } from '../../../../prediction/subModules/results/store/currentPlastId';
import { getPlastDistributions } from '../../../../proxy/subModules/results/gateways/gateway';
import { currentSpot } from '../../../store/well';
import { ChartBestMainOData, fromDateResults } from '../entities/chartBestMainOData';
import { ChartData, getKeyForO } from '../entities/chartData';
import { DateResults, DateResultsRaw } from '../entities/dateResults';
import { SiteDetails, SiteKindEnum } from '../entities/siteDetails';
import { getMultipleOptimization, requestSiteResults } from '../gateways/gateway';
import { chartTypeState } from './chartType';
import { dataModeState } from './dataMode';
import { dataModelTypeState } from './dataModelType';
import { selectedWellsState } from './selectedWells';
import { wellTypeState } from './wellType';

export const siteDetailsState = selector<SiteDetails>({
    key: 'optimizationResults__siteDetailsState',
    get: async ({ get }) => {
        const dataMode = get(dataModeState);
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        if (!well || !well.subScenarioId) {
            return null;
        }

        const { data: data } = await requestSiteResults(
            well,
            plastId,
            map(it => it.id, selectedWells)
        );

        return {
            bestMainO: data?.bestMainO,
            dataMode: dataMode,
            dynamic: map(shape, data?.data ?? []),
            info: well,
            kind: SiteKindEnum.Well,
            plastId: PlastModel.byObject().id,
            plasts: isNullOrEmpty(data.plasts) ? [] : data.plasts
        };
    }
});

export const charworksSelector = selector<WellTypeEnum[]>({
    key: 'optimizationResults__charworksSelector',
    get: async ({ get }) => {
        const site = get(siteDetailsState);
        const data = get(bestMainOData);

        if (!site?.info?.id || !site.dynamic.length) {
            return [WellTypeEnum.Oil, WellTypeEnum.Injection];
        }

        let wellTypes = [];
        if (any(x => x.liqRateINSIM > 0, data)) {
            wellTypes.push(WellTypeEnum.Oil);
        }

        if (any(x => x.injectionINSIM > 0, data)) {
            wellTypes.push(WellTypeEnum.Injection);
        }

        return wellTypes;
    }
});

const bestMainOData = selector<Nullable<DateResults[]>>({
    key: 'optimizationResults__bestMainOData',
    get: async ({ get }) => {
        const site = get(siteDetailsState);

        const data = site?.dynamic ?? null;
        const bestO = site?.bestMainO ?? null;

        if (isNil(data)) {
            return null;
        }

        return filter(propEq('mainO', bestO), data);
    }
});

/**
 * Возвращает данные для отображения на графике лучшего сценария
 */
export const chartBestMainOData = selector<ChartBestMainOData[]>({
    key: 'optimizationResults__chartBestMainOData',
    get: async ({ get }) => {
        const data = get(bestMainOData);

        if (isNil(data)) {
            return null;
        }

        const fromResults = x => fromDateResults(x);

        return pipe(sortBy(prop('date')), map(fromResults))(data);
    }
});

export const chartData = selector<ChartData[]>({
    key: 'optimizationResults__chartData',
    get: async ({ get }) => {
        const site = get(siteDetailsState);
        const wellType = get(wellTypeState);

        const data = site?.dynamic ?? null;

        if (isNil(data)) {
            return null;
        }

        return pipe(solderByDate(wellType), reject(isNil), sortBy(prop('date')))(data);
    }
});

export const chartPalette = selector<Nullable<KeyValuePair<string, string>[]>>({
    key: 'optimizationResults__chartPalette',
    get: async ({ get }) => {
        const site = get(siteDetailsState);

        const data = site?.dynamic ?? null;

        if (isNil(data)) {
            return null;
        }

        const keysMainO = pipe(pluck('mainO'), (x: number[]) => uniq(x), reject(equals(0)), map(getKeyForO))(data);

        return createRGBAPalette(keysMainO, ['rgb(175,222,128)', 'rgb(134,145,224)', 'rgb(227,105,186)']);
    }
});

export const plastDistributions = selector<PlastDistributionModel[]>({
    key: 'optimizationResults__plastDistributions',
    get: async ({ get }) => {
        const dataModelType = get(dataModelTypeState);
        const chartType = get(chartTypeState);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getPlastDistributions(well, currentWells, true);

        return map(
            it =>
                new PlastDistributionModel(
                    it.dt,
                    map(x => {
                        const isPercent = chartType === ChartType.PlastDistributionPercent;
                        const isOil = dataModelType === DataModelType.Oil;
                        const isLiq = dataModelType === DataModelType.Liq;
                        const isInj = dataModelType === DataModelType.Inj;

                        let value = 0;

                        if (isOil) {
                            value = isPercent ? x.perOil : x.sumPlastOilRateINSIM;
                        } else if (isLiq) {
                            value = isPercent ? x.perLiq : x.sumPlastLiqRateINSIM;
                        } else if (isInj) {
                            value = isPercent ? x.perInj : x.sumPlastInjectionINSIM;
                        }

                        return new PlastDetail(x.plastId, x.plastName, value);
                    }, it.details)
                ),
            response.data ?? []
        );
    }
});

export const reserveDevelopmentSelector = selector<ReserveDevelopmentWrapper>({
    key: 'optimizationResults__reserveDevelopmentSelector',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getReserveDevelopment(well, plastId, currentWells, true);

        return response.data;
    }
});

export const multipleWellDetailsSelector = selector<ChartBestMainOData[][]>({
    key: 'optimizationResults__multipleWellDetailsSelector',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);

        const response = await getMultipleOptimization(selectedWells, plastId);

        const fromResults = x => fromDateResults(x);

        return map(it => pipe(sortBy(prop('date')), map(fromResults))(it.data), response.data);
    }
});

export const shape = (raw: DateResultsRaw): DateResults => shapeRaw<DateResultsRaw, DateResults>(raw, ['date']);

const solderByDate = (charwork: WellTypeEnum) =>
    reduce<DateResults, ChartData[]>((acc: ChartData[], elem: DateResults): ChartData[] => {
        const existing = find(cd => cd.date === elem.date.getTime(), acc);
        if (!isNil(existing)) {
            injectValue(existing, elem.mainO, charwork === WellTypeEnum.Oil ? elem.oilRateINSIM : elem.injectionINSIM);

            return acc;
        }

        const newOne = {
            date: elem.date.getTime()
        } as ChartData;

        injectValue(newOne, elem.mainO, charwork === WellTypeEnum.Oil ? elem.oilRateINSIM : elem.injectionINSIM);

        return append<ChartData>(newOne, acc);
    }, []);

const injectValue = (element: ChartData, mainO: number, value: number): void => {
    if (mainO > 0) {
        element[getKeyForO(mainO)] = value;
    } else {
        element.nonOptimized = value;
    }
};
