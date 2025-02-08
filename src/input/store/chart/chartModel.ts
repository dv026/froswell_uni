import { WellBrief } from 'common/entities/wellBrief';
import { CharWorkEnum } from 'common/enums/charWorkEnum';
import { ChartCompareEnum } from 'common/enums/chartCompareEnum';
import {
    any,
    append,
    compose,
    filter,
    find,
    forEach,
    head,
    includes,
    isNil,
    last,
    map,
    mergeRight,
    prop,
    reject,
    sortBy,
    toLower,
    uniq
} from 'ramda';
import { atom, selector } from 'recoil';

import { ColumnType } from '../../../common/components/chart';
import { ParamDate } from '../../../common/entities/paramDate';
import { DataTypeEnum } from '../../../common/enums/dataTypeEnum';
import { ModeTypeEnum } from '../../../common/enums/modeType';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { dailyWells, merPlusDailyWells, merWells, stockBar } from '../../components/chart/chartHelper';
import { ChartDataModel } from '../../entities/chartDataModel';
import { MerState, WithDate } from '../../entities/merModel';
import { MerPlusDailyModel } from '../../entities/merPlusDailyModel';
import { getChartDataByParams, getChartDataOnlySelectedWells, getMultipleMers } from '../../gateways';
import { dataTypeState } from '../dataType';
import { modeTypeState } from '../modeType';
import { selectedWellsState } from '../selectedWells';
import { currentSpot } from '../well';
import { wellListState } from '../wells';
import { chartCompareState } from './chartCompare';

const sortByNameCaseInsensitive = sortBy(compose(toLower, prop('dt')));

const modelLoad = selector<ChartDataModel>({
    key: 'input__detailsLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        const model = new ChartDataModel(); // todo mb

        if (selectedWells && selectedWells.length > 1) {
            const { data } = await getChartDataOnlySelectedWells(
                map(it => new WellBrief(it.oilFieldId, it.id, it.prodObjId), selectedWells)
            );

            model.dataMers = data.mers;
            model.dataDaily = data.daily;
        } else {
            const [responseMers, responseDaily] = await getChartDataByParams(
                new WellBrief(well.oilFieldId, well.id, well.prodObjId)
            );

            model.dataMers = responseMers.data;
            model.dataDaily = responseDaily.data;
        }

        let result = [];
        forEach(x => {
            let obj = new MerPlusDailyModel(
                x.dt,
                x.oilTonnesRate,
                null,
                x.liquidVolumeRate,
                null,
                x.injectionRate,
                null,
                x.watercutVolume,
                null,
                x.pressureZab,
                null,
                x.wellsInWork
            );
            // eslint-disable-next-line eqeqeq
            let dly = find(d => d.dt == x.dt, model.dataDaily);
            if (dly) {
                obj.oilRate = dly.oilRate;
                obj.liqRate = dly.liqRate;
                obj.intakeLiqrate = dly.intakeLiqrate;
                obj.watercutVolumeDaily = dly.watercutVolume;
                obj.pressureZabDaily = dly.pressureZab;
            }

            result.push(obj);
        }, model.dataMers);

        forEach(x => {
            x.wellsInWork = (find(d => d.dt === x.dt, model.dataMers) || { wellsInWork: 0 }).wellsInWork;
        }, model.dataDaily);

        model.dataMerPlusDaily = sortByNameCaseInsensitive(result) as MerPlusDailyModel[];

        return model;
    }
});

export const chartModelState = atom<ChartDataModel>({
    key: 'input__chartModelState',
    default: modelLoad
});

export const chartMultipleMersSelector = selector<WithDate[][]>({
    key: 'input__chartMultipleMersSelector',
    get: async ({ get }) => {
        const selectedWells = get(selectedWellsState);

        let commonResult = [];

        const { data } = await getMultipleMers(
            map(it => new WellBrief(it.oilFieldId, it.id, it.prodObjId), selectedWells)
        );

        forEach(async it => {
            const model = new ChartDataModel(); // todo mb

            model.dataMers = it as MerState[];

            let result = [];
            forEach(x => {
                let obj = new MerPlusDailyModel(
                    x.dt,
                    x.oilTonnesRate,
                    null,
                    x.liquidVolumeRate,
                    null,
                    x.injectionRate,
                    null,
                    x.watercutVolume,
                    null,
                    x.pressureZab,
                    null,
                    x.wellsInWork
                );

                result.push(obj);
            }, model.dataMers);

            result = convertDates(model.dataMers);

            commonResult.push(
                isNullOrEmpty(result) ? [] : sortBy<WithDate>(prop('dt'), result.length ? result : [{ dt: new Date() }])
            );
        }, data);

        return commonResult;
    }
});

export const columnsSelector = selector<ColumnType[]>({
    key: 'input__columnsSelector',
    get: async ({ get }) => {
        const dataType = get(dataTypeState);
        const modeType = get(modeTypeState);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);
        const compareType = get(chartCompareState);

        const filterBy = (data: ColumnType[]): ColumnType[] => {
            let columns = uniq<ColumnType>(
                filter(
                    w => modeType === w.type || (w.type === ModeTypeEnum.All && modeType !== ModeTypeEnum.Accumulated),
                    data
                )
            );

            if (isNullOrEmpty(selectedWells) || compareType === ChartCompareEnum.Multiple) {
                columns = reject(
                    (it: ColumnType) => includes(it.key, ['pressureZabOil', 'pressureZabInjection']),
                    columns
                );
            } else {
                columns = reject((it: ColumnType) => includes(it.key, ['pressureZab']), columns);
            }

            return !well.id ? append(stockBar(), columns) : columns;
        };

        switch (dataType) {
            case DataTypeEnum.Mer:
                return filterBy(merWells);
            case DataTypeEnum.Daily:
                return filterBy(dailyWells);
            case DataTypeEnum.MerPlusDaily:
                return filterBy(merPlusDailyWells);
        }

        return null;
    }
});

export const chartDataSelector = selector<WithDate[]>({
    key: 'input__chartDataSelector',
    get: async ({ get }) => {
        const dataType = get(dataTypeState);
        const model = get(chartModelState);

        let result = null;
        switch (dataType) {
            case DataTypeEnum.Mer:
                result = convertDates(model.dataMers);
                break;
            case DataTypeEnum.Daily:
                result = convertDates(model.dataDaily);
                break;
            case DataTypeEnum.MerPlusDaily:
                result = convertDates(model.dataMerPlusDaily);
                break;
        }

        return sortBy<WithDate>(prop('dt'), result && result.length ? result : [{ dt: new Date() }]);
    }
});

export const rangeDataSelector = selector<ParamDate[]>({
    key: 'input__rangeDataSelector',
    get: async ({ get }) => {
        const actualColumn = find(it => it.order === 1, get(columnsSelector));
        if (!actualColumn) {
            return [];
        }

        let data = get(chartDataSelector);
        if (!data) {
            return [];
        }

        return map(x => ({ value: x[actualColumn.key], date: x.dt } as ParamDate), data);
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertDates = (data: any): WithDate[] => {
    return map(x => mergeRight(x, { dt: new Date(x.dt) }) as WithDate, data ?? []);
};
