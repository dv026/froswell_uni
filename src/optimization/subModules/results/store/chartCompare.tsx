import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { ColumnType } from '../../../../common/components/chart';
import { getCompareColumns, generateCompareData } from '../../../../common/components/compareChart/compareChartHelper';
import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { InputCompareModel } from '../../../../input/entities/inputCompareModel';
import { getChartCompareData } from '../../../../proxy/subModules/results/gateways/gateway';
import { selectedWellsState } from './selectedWells';
import { showRepairsState } from './showRepairs';

export const chartCompareState = atom<ChartCompareEnum>({
    key: 'optimization__chartCompareState',
    default: ChartCompareEnum.Sum
});

const initialCompareData = selector<InputCompareModel[]>({
    key: 'optimization__initialCompareData',
    get: async ({ get }) => {
        const param = get(chartCompareState);
        const wells = get(selectedWellsState);
        const plastId = get(currentPlastId);

        if (param === ChartCompareEnum.Sum) {
            return [];
        }

        const response = await getChartCompareData(param, wells, plastId, true);

        if (response.error || !response.data) {
            return [];
        }

        return response.data;
    }
});

export const chartCompareData = selector<InputCompareModel[]>({
    key: 'optimization__chartCompareData',
    get: async ({ get }) => {
        const data = get(initialCompareData);

        return generateCompareData(data);
    }
});

export const chartCompareColumns = selector<ColumnType[]>({
    key: 'optimization__chartCompareColumns',
    get: async ({ get }) => {
        const data = get(initialCompareData);
        const selectedWells = get(selectedWellsState);
        const param = get(chartCompareState);
        const withRepairs = get(showRepairsState);

        return getCompareColumns(data, selectedWells, param, withRepairs, true);
    }
});
