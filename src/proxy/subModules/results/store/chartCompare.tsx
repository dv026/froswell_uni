import { split, takeLast } from 'ramda';
import { atom, selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { ColumnType } from '../../../../common/components/chart';
import { getCompareColumns, generateCompareData } from '../../../../common/components/compareChart/compareChartHelper';
import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { InputCompareModel } from '../../../../input/entities/inputCompareModel';
import { getChartCompareData } from '../gateways/gateway';
import { selectedWellsState } from './selectedWells';
import { showRepairsState } from './showRepairs';
import { сurrentParamIdState } from './сurrentParamId';

export const chartCompareState = atom<ChartCompareEnum>({
    key: 'proxy__chartCompareState',
    default: ChartCompareEnum.Sum
});

const initialCompareData = selector<InputCompareModel[]>({
    key: 'proxy__initialCompareData',
    get: async ({ get }) => {
        const param = get(chartCompareState);
        const wells = get(selectedWellsState);
        const plast = get(currentPlastId);
        const currentParamId = get(сurrentParamIdState);

        if (param === ChartCompareEnum.Sum) {
            return [];
        }

        let plastId = plast;

        if (currentParamId) {
            const params = takeLast(2, split('-', currentParamId));
            plastId = +params[1];
        }

        const response = await getChartCompareData(param, wells, plastId, false);

        if (response.error || !response.data) {
            return [];
        }

        return response.data;
    }
});

export const chartCompareData = selector<InputCompareModel[]>({
    key: 'proxy__chartCompareData',
    get: async ({ get }) => {
        const data = get(initialCompareData);

        return generateCompareData(data);
    }
});

export const chartCompareColumns = selector<ColumnType[]>({
    key: 'proxy__chartCompareColumns',
    get: async ({ get }) => {
        const data = get(initialCompareData);
        const selectedWells = get(selectedWellsState);
        const param = get(chartCompareState);
        const withRepairs = get(showRepairsState);

        return getCompareColumns(data, selectedWells, param, withRepairs, true);
    }
});
