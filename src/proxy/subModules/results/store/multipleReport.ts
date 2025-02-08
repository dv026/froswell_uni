import { currentScenarioId } from 'calculation/store/currentScenarioId';
import { map, pathOr } from 'ramda';
import { selector } from 'recoil';

import { shallow } from '../../../../common/helpers/ramda';
import { WellINSIM } from '../../../entities/insim/well';
import { NeighborModel } from '../../../entities/neighborModel';
import { PlastInfo } from '../../../entities/report/plastInfo';
import { create, WellReport } from '../../../entities/report/wellReport';
import { getMultipleInsim } from '../gateways/gateway';
import { selectedWellsState } from './selectedWells';

export const multipleReportState = selector<WellReport[]>({
    key: 'proxyResults__multipleReportState',
    get: async ({ get }) => {
        const selectedWells = get(selectedWellsState);
        const scenarioId = get(currentScenarioId);

        if (!selectedWells || selectedWells.length < 2) {
            return null;
        }

        const responseInsim = await getMultipleInsim(selectedWells);

        let result = [];

        map(it => {
            const report = create([scenarioId, null]);

            result.push(
                shallow(report, {
                    //adaptationWells: responseData.data.data,
                    plasts: it?.plasts as PlastInfo[],
                    plastId: null,
                    insim: WellINSIM.fromRaw(it?.data),
                    neighbors: map(NeighborModel.fromRaw, pathOr([], ['data', 'neighbors'], it))
                })
            );
        }, responseInsim.data);

        return result;
    }
});
