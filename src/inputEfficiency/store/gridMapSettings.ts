import { currentPlastId } from 'calculation/store/currentPlastId';
import { currentGridMap } from 'calculation/store/gridMap';
import { krigingVariationState } from 'calculation/store/krigingVariation';
import { mapIsolineSettings } from 'calculation/store/mapIsolineSettings';
import { GridMapSettings } from 'common/entities/gridMapSettings';
import { GridMapEnum } from 'common/enums/gridMapEnum';
import { shallow } from 'common/helpers/ramda';
import { refresher } from 'common/helpers/recoil';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { evaluationTypeState } from 'commonEfficiency/store/evaluationType';
import { KrigingCalcSettingsModel } from 'input/entities/krigingCalcSettings';
import { getMapGrid, getMapGridForce } from 'input/gateways';
import { historyDateState } from 'input/store/map/historyDate';
import { currentSpot } from 'input/store/well';
import { selector } from 'recoil';

export const refresherGridMap = refresher('inputEfficiency', 'gridMap');

export const gridMapVariationSettings = selector<GridMapSettings>({
    key: 'inputEfficiency__gridMapVariationSettings',
    get: async ({ get }) => {
        const evaluationType = get(evaluationTypeState);
        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const settings = get(krigingVariationState);
        const well = get(currentSpot);

        let model = new KrigingCalcSettingsModel();

        const isInsim = evaluationType === EvaluationTypeEnum.Insim;

        const response = await getMapGridForce(
            settings.parameter,
            shallow(model, {
                oilFieldId: well.oilFieldId,
                productionObjectId: well.prodObjId,
                scenarioId: isInsim ? well.scenarioId : null,
                subScenarioId: isInsim ? well.subScenarioId : null,
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
    key: 'inputEfficiency__gridMapSettings',
    get: async ({ get }) => {
        const gridMap = get(currentGridMap);
        const historyDate = get(historyDateState);

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

        get(refresherGridMap);

        const isolineSettings = get(mapIsolineSettings);
        const plastId = get(currentPlastId);
        const well = get(currentSpot);

        const response = await getMapGrid(
            gridMap,
            [well],
            plastId,
            historyDate ? new Date(historyDate) : null,
            isolineSettings
        );

        return GridMapSettings.fromRaw(response.data);
    }
});
