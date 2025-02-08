import { selector } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { currentGridMap } from '../../../../calculation/store/gridMap';
import { krigingVariationState } from '../../../../calculation/store/krigingVariation';
import { mapIsolineSettings } from '../../../../calculation/store/mapIsolineSettings';
import { GridMapSettings } from '../../../../common/entities/gridMapSettings';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { shallow } from '../../../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../../../input/entities/krigingCalcSettings';
import { getMapGrid, getMapGridForce } from '../../../../input/gateways';
import { currentSpot } from '../../../store/well';
import { historyDateState } from './historyDate';

export const gridMapVariationSettings = selector<GridMapSettings>({
    key: 'optimizationResults__gridMapVariationSettings',
    get: async ({ get }) => {
        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const settings = get(krigingVariationState);
        const well = get(currentSpot);

        let model = new KrigingCalcSettingsModel();

        const response = await getMapGridForce(
            settings.parameter,
            shallow(model, {
                oilFieldId: well.oilFieldId,
                productionObjectId: well.prodObjId,
                scenarioId: well.scenarioId,
                subScenarioId: well.subScenarioId,
                plastId: plastId,
                startDate: settings.startDate,
                endDate: settings.endDate
            }),
            isolineSettings,
            true
        );

        return GridMapSettings.fromRaw(response.data);
    }
});

export const gridMapSettings = selector<GridMapSettings>({
    key: 'optimizationMap__gridMapSettings',
    get: async ({ get }) => {
        const gridMap = get(currentGridMap);

        if (gridMap === GridMapEnum.None) {
            return new GridMapSettings();
        }

        if (
            gridMap === GridMapEnum.LiqRateVariation ||
            gridMap === GridMapEnum.OilRateVariation ||
            gridMap === GridMapEnum.VolumeWaterCutVariation ||
            gridMap === GridMapEnum.InjectionRateVariation ||
            gridMap === GridMapEnum.PressureZabVariation ||
            gridMap === GridMapEnum.MultiplePressureLiqRate
        ) {
            return get(gridMapVariationSettings);
        }

        let historyDate = null;

        if (
            gridMap === GridMapEnum.Pressure ||
            gridMap === GridMapEnum.VolumeWaterCut ||
            gridMap === GridMapEnum.CurrentOilSaturatedThickness ||
            gridMap === GridMapEnum.CurrentKH ||
            gridMap === GridMapEnum.SkinFactor
        ) {
            historyDate = get(historyDateState);
        }

        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        const response = await getMapGrid(gridMap, [well], plastId, historyDate, isolineSettings, true);

        return GridMapSettings.fromRaw(response.data);
    }
});
