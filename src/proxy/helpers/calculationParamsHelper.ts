import { find } from 'ramda';

import { CalculationModeEnum } from '../../calculation/enums/calculationModeEnum';
import { Range } from '../../common/entities/range';
import { InsimCalculationParams, makeFromTemplate, makeFromTemplates } from '../entities/insimCalculationParams';
import { CalculationTemplate } from '../entities/wellDetailsModel';

export const createModeParams = (
    templates: CalculationTemplate[],
    templateNew: CalculationTemplate,
    scenarioId: number,
    adaptationRange: Range<Date>
): [CalculationModeEnum, InsimCalculationParams][] => [
    [CalculationModeEnum.Improvement, makeFromTemplates(templates, scenarioId, adaptationRange)],
    [CalculationModeEnum.Creation, makeFromTemplate(templateNew, adaptationRange)],
    [CalculationModeEnum.Prediction, makeFromTemplates(templates, scenarioId, adaptationRange, true)]
];

export const updateModeParams = (
    templates: CalculationTemplate[],
    scenarioId: number,
    old: [CalculationModeEnum, InsimCalculationParams][],
    adaptationRange: Range<Date>
): [CalculationModeEnum, InsimCalculationParams][] => [
    [CalculationModeEnum.Improvement, makeFromTemplates(templates, scenarioId, adaptationRange)],
    [CalculationModeEnum.Creation, find(x => x[0] === CalculationModeEnum.Creation, old)[1]],
    [
        CalculationModeEnum.Prediction,
        updatePrediction(
            templates,
            scenarioId,
            adaptationRange,
            find(x => x[0] === CalculationModeEnum.Prediction, old)[1]
        )
    ]
];

const updatePrediction = (
    templates: CalculationTemplate[],
    scenarioId: number,
    adaptationRange: Range<Date>,
    old: InsimCalculationParams
): InsimCalculationParams => {
    const newParams: InsimCalculationParams = makeFromTemplates(templates, scenarioId, adaptationRange, true);

    newParams.forecastEnd = old.forecastEnd;
    return newParams;
};
