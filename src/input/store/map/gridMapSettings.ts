import { selector } from 'recoil';

import { GridMapSettings } from '../../../common/entities/gridMapSettings';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { isNullOrEmpty, shallow } from '../../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../entities/krigingCalcSettings';
import { getMapGrid, getMapGridForce } from '../../gateways';
import { currentPlastId } from '../plast';
import { selectedWellsState } from '../selectedWells';
import { currentSpot } from '../well';
import { currentGridMap } from './gridMap';
import { historyDateState } from './historyDate';
import { krigingVariationState } from './krigingVariation';
import { mapIsolineSettings } from './mapIsolineSettings';
import { mapSettingsState } from './mapSettings';

export const gridMapVariationSettings = selector<GridMapSettings>({
    key: 'input__gridMapVariationSettings',
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
                plastId: plastId,
                startDate: settings.startDate,
                endDate: settings.endDate
            }),
            isolineSettings
        );

        return GridMapSettings.fromRaw(response.data);
    }
});

export const gridMapSettings = selector<GridMapSettings>({
    key: 'input__gridMapSettings',
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

        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        let historyDate = null;

        if (gridMap === GridMapEnum.PressureZab) {
            const mapSettings = get(mapSettingsState);
            const date = get(historyDateState);

            historyDate = new Date(date ? date : mapSettings.mapHistoryRange?.maxRange);
        }

        const response = await getMapGrid(
            gridMap,
            isNullOrEmpty(selectedWells) ? [well] : selectedWells,
            plastId,
            historyDate,
            isolineSettings
        );

        return GridMapSettings.fromRaw(response.data);
    }
});
