import { atom, selector } from 'recoil';

import { ColumnType } from '../../../common/components/chart';
import { generateCompareData, getCompareColumns } from '../../../common/components/compareChart/compareChartHelper';
import { ChartCompareEnum } from '../../../common/enums/chartCompareEnum';
import { InputCompareModel } from '../../entities/inputCompareModel';
import { getChartCompareData } from '../../gateways';
import { selectedWellsState } from '../selectedWells';
import { showRepairsState } from './showRepairs';

export const chartCompareState = atom<ChartCompareEnum>({
    key: 'input__chartCompareState',
    default: ChartCompareEnum.Sum
});

const initialCompareData = selector<InputCompareModel[]>({
    key: 'input__initialCompareData',
    get: async ({ get }) => {
        const param = get(chartCompareState);
        const wells = get(selectedWellsState);

        if (param === ChartCompareEnum.Sum) {
            return [];
        }

        const response = await getChartCompareData(param, wells);

        if (response.error || !response.data) {
            return [];
        }

        return response.data;
    }
});

export const chartCompareData = selector<InputCompareModel[]>({
    key: 'input__chartCompareData',
    get: async ({ get }) => {
        const data = get(initialCompareData);

        return generateCompareData(data);
    }
});

export const chartCompareColumns = selector<ColumnType[]>({
    key: 'input__chartCompareColumns',
    get: async ({ get }) => {
        const data = get(initialCompareData);
        const selectedWells = get(selectedWellsState);
        const param = get(chartCompareState);
        const withRepairs = get(showRepairsState);

        return getCompareColumns(data, selectedWells, param, withRepairs);
    }
});
