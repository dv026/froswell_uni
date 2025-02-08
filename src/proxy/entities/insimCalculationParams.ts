import { find, isNil } from 'ramda';

import { Range } from '../../common/entities/range';
import { addMonth, addYears, isValidDate } from '../../common/helpers/date';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { PeriodTypeEnum } from '../subModules/calculation/enums/periodTypeEnum';
import { OptimizationParams } from './optimizationParams';
import { CalculationTemplate } from './wellDetailsModel';

export class InsimCalculationParams {
    /**
     * Радиус отбора соседей, м
     */
    public radius: number;

    /**
     * Минимальное расстояние между скважинами для отбора соседей, м
     */
    public deadRadius: number;

    /**
     * Список пластов для расчета
     */
    public plastIds: number[];

    /**
     * Использовать лучший результат предыдущего расчета
     */
    public searchBestModel: boolean;

    /**
     * Дата окончания прогноза
     */
    public forecastEnd: Date;

    /**
     * Дата окончания адаптации
     */
    public adaptationEnd: Date;

    /**
     * Дата начала адаптации
     */
    public adaptationStart: Date;

    /**
     * Дата окончания прогноза по умолчанию
     */
    public defaultForecastEnd: Date;

    /**
     * Дата окончания адаптации по умолчанию
     */
    public defaultAdaptationEnd: Date;

    /**
     * Дата начала адаптации по умолчанию
     */
    public defaultAdaptationStart: Date;

    /**
     * Количество проводимых адаптаций
     */
    public adaptations: number;

    /**
     * Угол поиска межскважинных соединений
     */
    public searchAngle: number;

    /**
     * Процент отклонения значений проводимости (геомодель)
     */
    public transmissibilitiesLimit: number;

    /**
     * Процент отклонения значений объема межскважинных соединений (геомодель)
     */
    public preVolumeLimit: number;

    /**
     * Процент отклонения значений параметров ОФП
     */
    public permeabilitiesLimit: number;

    /**
     * Процент отклонения значений геологических запасов
     */
    public reservesLimit: number;

    /**
     * Необходимость адаптации коэффициента проницаемостей OilC1
     */
    public adaptOilC1: boolean;

    /**
     * Необходимость адаптации коэффициента проницаемостей OilC2
     */
    public adaptOilC2: boolean;

    /**
     * Необходимость адаптации коэффициента проницаемостей WaterC1
     */
    public adaptWaterC1: boolean;

    /**
     * Необходимость адаптации коэффициента проницаемостей WaterC2
     */
    public adaptWaterC2: boolean;

    /**
     * Необходимо ли адаптировать параметры регионов пластов
     */
    public adaptRegions: boolean;

    /**
     * Необходимо ли адаптировать границы водонасыщенности межскважинных соединений
     */
    public adaptSaturations: boolean;

    /**
     * Необходимо ли адаптировать насыщенности точек межскважинных соединений (точки фронт трекинга)
     */
    public adaptSaturationsOfInterwellPoints: boolean;

    /**
     * Сохранять только лучшую адаптацию
     */
    public saveOnlyBestA: boolean;

    /**
     * Сохранять данные насыщенности на все даты (фронт трекинг)
     */
    public saveAllFrontTracking: boolean;

    /**
     * Протягивать ли величину дебита жидкости с последней даты адаптации
     * (Только расчет в режиме прогноза)
     */
    public constantLiqRate: boolean;

    /**
     * Протягивать ли величину закачки с последней даты адаптации
     * (Только расчет в режиме прогноза)
     */
    public constantInjection: boolean;

    public period: number;

    public periodType: PeriodTypeEnum;

    /**
     * Количество прогнозных сценариев
     */
    public modelCount: number;

    /**
     * Максимальное значение обводненности, после которой скважина останавливается
     * TIP: применяется только для добывающих скважин
     */
    public watercutLimit: number;

    /**
     * Минимальное значение дебита нефти, после которой скважина останавливается
     * TIP: применяется только для добывающих скважин
     */
    public oilRateLimit: number;

    /**
     * Длина спринта адаптации скин-фактора (количество итераций)
     */
    public sprintSkinFactorLength: number;

    /**
     * Длина спринта адаптации геомодели (количество итераций)
     */
    public sprintGeoModelLength: number;

    /**
     * Длина спринта адаптации проницаемостей (количество итераций)
     */
    public sprintPermeabilitiesLength: number;

    public optimizationParams: OptimizationParams;

    /**
     * Минимальное значение скин-фактора
     */
    public minSkinFactor: number;

    /**
     * Максимальное значение скин-фактора
     */
    public maxSkinFactor: number;

    /**
     * Тип движка для расчета.
     * TODO: вероятно, временное свойство. Если станет постоянным, то необходимо переделать в соответствующий enum.
     */
    public engineType: number;

    public useInjectionRepairs: boolean;

    public oilErrorWeight: number;
    public liquidErrorWeight: number;
    public injectionErrorWeight: number;
    public pressureErrorWeight: number;
    public flowErrorWeight: number;
    public pressureZabErrorWeight: number;
    public watercutErrorWeight: number;

    public predictionStart = (): Date => addMonth(this.adaptationEnd, 1);
}

export const makeFromTemplates = (
    templates: CalculationTemplate[],
    scenarioId: number,
    adaptationRange: Range<Date>,
    forPrediction: boolean = false
): InsimCalculationParams => {
    const template = !isNullOrEmpty(templates) ? find(x => x.scenarioId === scenarioId, templates) : null;

    return makeFromTemplate(template, adaptationRange, forPrediction);
};

export const makeFromTemplate = (
    template: CalculationTemplate,
    adaptationRange: Range<Date>,
    forPrediction: boolean = false
): InsimCalculationParams => {
    if (isNil(template)) {
        return null;
    }

    let entity = new InsimCalculationParams();

    const adaptationStart: Date = toDate(template.adaptationStart);
    const adaptationEnd: Date = toDate(template.adaptationEnd);

    const predictionStart: Date = addMonth(adaptationEnd, 1);

    entity.defaultAdaptationStart = adaptationRange.min;
    entity.defaultAdaptationEnd = adaptationRange.max;
    entity.defaultForecastEnd = addYears(predictionStart, 100);

    entity.adaptationStart = adaptationStart ? new Date(adaptationStart) : null;
    entity.adaptationEnd = adaptationEnd ? new Date(adaptationEnd) : null;
    entity.forecastEnd = forPrediction
        ? toDate(template.predictionEnd) || addYears(predictionStart, 1)
        : toDate(template.predictionEnd) || addMonth(predictionStart, template.optPeriod);

    entity.plastIds = template.plastIds;
    entity.adaptations = forPrediction ? 1 : template.adaptations || 1;
    entity.transmissibilitiesLimit = template.transmissibilitiesLimit || 50;
    entity.preVolumeLimit = template.preVolumeLimit || 50;

    entity.permeabilitiesLimit = template.permeabilitiesLimit ?? 0;
    entity.reservesLimit = template.reservesLimit ?? 0;
    entity.adaptOilC1 = template.adaptOilC1 ?? false;
    entity.adaptOilC2 = template.adaptOilC2 ?? true;
    entity.adaptWaterC1 = template.adaptWaterC1 ?? true;
    entity.adaptWaterC2 = template.adaptWaterC2 ?? true;
    entity.adaptRegions = template.adaptRegions ?? false;
    entity.adaptSaturations = template.adaptSaturations ?? false;

    entity.searchBestModel = template.searchBestModel || false;
    entity.saveOnlyBestA = template.saveOnlyBestA || false;

    entity.period = template.period;
    entity.periodType = template.periodType;

    entity.modelCount = template.modelCount;

    entity.adaptSaturationsOfInterwellPoints = template.adaptSaturationsOfInterwellPoints;

    entity.watercutLimit = template.watercutLimit ?? 95;
    entity.oilRateLimit = template.oilRateLimit ?? 1;

    entity.sprintSkinFactorLength = template.sprintSkinFactorLength ?? 50;
    entity.sprintGeoModelLength = template.sprintInitialsLength ?? 50;
    entity.sprintPermeabilitiesLength = template.sprintPermeabilitiesLength ?? 50;

    entity.minSkinFactor = template.minSkinFactor;
    entity.maxSkinFactor = template.maxSkinFactor;

    entity.saveAllFrontTracking = template.saveAllFrontTracking;

    entity.oilErrorWeight = template.oilErrorWeight;
    entity.liquidErrorWeight = template.liquidErrorWeight;
    entity.injectionErrorWeight = template.injectionErrorWeight;
    entity.pressureErrorWeight = template.pressureErrorWeight;
    entity.flowErrorWeight = template.flowErrorWeight;
    entity.pressureZabErrorWeight = template.pressureZabErrorWeight;
    entity.watercutErrorWeight = template.watercutErrorWeight;

    entity.engineType = 2;

    entity.optimizationParams = {
        optimizeSkinFactorStartDate: template.optimizeSkinFactorStartDate ?? addMonth(new Date(adaptationEnd), 1),
        optimizeBhpStartDate: template.optimizeBhpStartDate ?? addMonth(new Date(adaptationEnd), 1),
        skinFactorWells: template.skinFactorWells,
        modelCount: template.mainOCount,
        trials: template.trials,
        target: template.target,
        pressureVariance: template.pressureVariance,
        period: template.optPeriod,
        saveOnlyBestO: template.saveOnlyBestO,
        usePredictionSkinFactors: template.usePredictionSkinFactors,
        iterationsBhp: template.iterationsBhp,
        iterationsGtm: template.iterationsGtm
    };

    return entity;
};

const toDate = dateRaw => (isValidDate(dateRaw) ? new Date(dateRaw) : null);
