import { head, map, pathOr, pipe, reverse, sortBy } from 'ramda';
import { selector } from 'recoil';

import { addMissingDates, createEmptyParamDate, ParamDate } from '../../common/entities/paramDate';
import { createEmptyParamDateOrig, ParamDateOrig } from '../../common/entities/paramDateOrig';
import { Range } from '../../common/entities/range';
import { WellBrief } from '../../common/entities/wellBrief';
import { LoadWellPayload } from '../../proxy/entities/payloads';
import { create as createObjectReport } from '../../proxy/entities/report/objectReport';
import { CalculationTemplate, WellDetailsModel } from '../../proxy/entities/wellDetailsModel';
import { getPreparationObject } from '../../proxy/gateways/gateway';
import { getCurrentSchemaId, ScenarioModel, sortScenariosById } from '../entities/scenarioModel';
import { currentScenarioId } from './currentScenarioId';
import { currentOilFieldId, currentProductionObjectId } from './userWell';

const scenariosFromResponse = (response): ScenarioModel[] => {
    const scenarios: ScenarioModel[] = shapeScenarios(pathOr([], ['data', 'scenarios'], response));

    return scenarios;
};

const injectPlasts = (plasts, well: WellDetailsModel): void => {
    well.plasts = plasts;
    well.plastIdForOpen = (head(well.plasts) || { id: 0 }).id;
};

const shapeScenarios = raw =>
    map(x => new ScenarioModel(x.id, x.name, x.productionObjectId, x.lastUpdateDate, x.subScenarios, x.isAuto), raw);

const shapeWell = (well: WellBrief): WellDetailsModel => {
    const model = new WellDetailsModel();

    model.oilFieldId = well.oilFieldId;
    model.productionObjectId = well.prodObjId;
    model.id = well.id;
    model.charWorkId = well.charWorkId;

    return model;
};

// const initialInsimSettingsRefresherState = atom({
//     key: 'calculation__initialInsimSettingsRefresherState',
//     default: 0
// });

// export const initialInsimSettingsRefresher = selector({
//     key: 'calculation__initialInsimSettingsRefresher',
//     get: async ({ get }) => {
//         return get(initialInsimSettingsRefresherState);
//     },
//     set: ({ get, set }) => {
//         const previous = get(initialInsimSettingsRefresherState);

//         set(initialInsimSettingsRefresherState, previous + 1);
//     }
// });

export const initialSettings = selector<LoadWellPayload>({
    key: 'calculation__initialSettings',
    get: async ({ get }) => {
        const oilFieldId = get(currentOilFieldId);
        const productionObjectId = get(currentProductionObjectId);
        const scenarioId = get(currentScenarioId);

        if (!oilFieldId || !productionObjectId) {
            return null;
        }

        const response = await getPreparationObject(productionObjectId, oilFieldId, scenarioId);

        const sortedScenarios = sortScenariosById(scenariosFromResponse(response));

        const well = shapeWell(new WellBrief(oilFieldId, null, productionObjectId, null, scenarioId));
        //well.scenarioId = getCurrentScenarioId(sortedScenarios, well.scenarioId);
        //well.subScenarioId = getCurrentSubScenarioId(sortedScenarios, well.scenarioId, well.subScenarioId);

        injectPlasts(pathOr([], ['data', 'plasts'], response), well);

        // загрузка данных для объекта
        const range = new Range<Date>(
            new Date(response.data.adaptationRange.startDate),
            new Date(response.data.adaptationRange.endDate)
        );

        const templates = pipe(
            map(CalculationTemplate.fromRaw),
            sortBy(x => x.lastUpdateDate),
            list => reverse<CalculationTemplate>(list)
        )(response.data.templates || []);
        const templateNew = CalculationTemplate.fromRaw(response.data.templateNew);
        //const mode = isEmpty(templates) ? CalculationModeEnum.Creation : CalculationModeEnum.Improvement;

        well.oilRateDynamic = addMissingDates<ParamDate>(
            map(ParamDate.fromRaw, response.data.oilRateDynamic),
            createEmptyParamDate
        );
        well.oilRateDiffDynamic = addMissingDates<ParamDateOrig>(
            map(ParamDateOrig.fromRaw, response.data.oilRateDiffDynamic),
            createEmptyParamDateOrig
        );

        return {
            adaptationRange: range,
            clearCalculationItems: true, // todo mb clearCalculationItems,
            templates: templates,
            templateNew: templateNew,
            sublayers: response.data.sublayers,
            scenarios: sortedScenarios,
            well: well,
            report: createObjectReport(getCurrentSchemaId(sortedScenarios))
        };
    }
});
