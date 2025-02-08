import { filter, forEach, includes, map, mean } from 'ramda';
import { selector } from 'recoil';

import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { round2 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { currentSpot } from '../../../store/well';
import { optimizationWellsNumbers } from '../../wellGroup/store/optimizationWells';
import { getTypeByVolume } from '../components/wellSetupUnitByWaterCut';
import { ModuleModel } from '../entities/moduleModel';
import { WellSetupRaw } from '../entities/wellSetupRaw';
import { WellSetupSavedModel } from '../entities/wellSetupSavedModel';
import { requestWellSetups } from '../gateways/gateway';

export const moduleState = selector<ModuleModel>({
    key: 'optimizationLimits__moduleState',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const filteredWells = get(optimizationWellsNumbers);

        const { data: response } = await requestWellSetups(well);

        return { setups: filter(it => includes(it.wellId, filteredWells), response.data), saved: response.saved };
    }
});

export const defaultLimitsSelector = selector<WellSetupSavedModel[]>({
    key: 'optimizationLimits__defaultLimitsSelector',
    get: async ({ get }) => {
        const module = get(moduleState);
        const subScenarioId = get(currentSubScenarioId);

        const dataOil = filter(it => it.charWorkId === WellTypeEnum.Oil, module.setups);
        const dataInj = filter(it => it.charWorkId === WellTypeEnum.Injection, module.setups);

        const avgMinPressureZabInj = mean(map((it: WellSetupRaw) => it.maxPressureZab, dataInj));

        const types = [1, 2, 3, 4];

        let result = [];

        forEach(
            wellType => {
                forEach(type => {
                    const data = wellType === WellTypeEnum.Oil ? dataOil : dataInj;

                    const items = filter(it => getTypeByVolume(it.volumeWaterCut) === type, data);

                    if (isNullOrEmpty(items)) {
                        return;
                    }

                    result.push({
                        id: 0,
                        subScenarioId: subScenarioId,
                        wells: map(it => it.wellId, items),
                        wellType: wellType,
                        type: type,
                        minPressureZab:
                            wellType === WellTypeEnum.Oil
                                ? round2(mean(map((it: WellSetupRaw) => it.minPressureZab, items)))
                                : round2(avgMinPressureZabInj),
                        isManual: false
                    });
                }, types);
            },
            [WellTypeEnum.Oil, WellTypeEnum.Injection]
        );

        return result;
    }
});
