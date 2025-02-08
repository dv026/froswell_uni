import { isNil } from 'ramda';

import { PlastDistributionRaw } from '../../calculation/entities/plastDistributionRaw';
import { ParamDate } from '../../common/entities/paramDate';
import { ParamDateOrig } from '../../common/entities/paramDateOrig';
import { WellPointWithPlast } from '../../common/entities/wellPoint';
import { OptimizationTargetEnum } from '../../common/enums/optimizationTargetEnum';
import { addMonth } from '../../common/helpers/date';
import { round0 } from '../../common/helpers/math';
import { CalculationDataEnum } from '../subModules/calculation/enums/calculationDataEnum';
import { ResultDataTypeEnum } from '../subModules/calculation/enums/resultDataTypeEnum';
import { AdaptationSummary } from './insim/adaptationSummary';
import { PlastModel } from './plastModel';

export class WellDetailsModel {
    public id: number;

    /**
     * Имеется ли для этой скважины сохранённый расчет коэффициентов по INSIM модели
     */
    public hasSavedINSIM: boolean;

    public productionObjectId: number;

    public charWorkId: number;

    public oilFieldId: number;

    /**
     * Уникальный идентификатор сохраненных на сервере коэффициентов
     */
    public cacheKey: string;

    /**
     * Режим отображения (открыт ли существующий расчет, или сгенерирован новый)
     */
    public mode: CalculationDataEnum;

    /**
     * Режим отображение данных для insim
     */
    public adaptationMode: ResultDataTypeEnum;

    /**
     * Точки для карты
     */
    public points: WellPointWithPlast[];

    public param: number;

    /**
     * Ид пласта для открытия сохраненных данных insim
     */
    public plastIdForOpen: number;

    public plasts: PlastModel[];

    public adaptationsSummary: AdaptationSummary[];

    public oilRateDynamic: ParamDate[];

    public oilRateDiffDynamic: ParamDateOrig[];

    public plastDistributions: PlastDistributionRaw[];

    public constructor() {
        // по умолчанию загружать адаптацию
        this.adaptationMode = ResultDataTypeEnum.Adaptation;

        this.adaptationsSummary = [];

        this.oilRateDiffDynamic = [];
        this.oilRateDynamic = [];
    }
}

export interface ICalculationTemplate {
    scenarioId: number;
    adaptations: number;
    adaptationStart: string;
    adaptationEnd: string;
    predictionEnd: string;
    radius: number;
    deadRadius: number;
    searchAngle: number;
    searchBestModel: boolean;
    transmissibilitiesLimit: number;
    preVolumeLimit: number;
    permeabilitiesLimit: number;
    reservesLimit: number;
    adaptOilC1: boolean;
    adaptOilC2: boolean;
    adaptWaterC1: boolean;
    adaptWaterC2: boolean;
    saveOnlyBestA: boolean;
    oilErrorTotalMAPE: number;
    liqErrorTotalMAPE: number;
    plastIds: number[];
    period: number;
    periodType: number;
    modelCount: number;
    watercutLimit: number;
    oilRateLimit: number;
    lastUpdateDate: string;
    skinFactorOptimizationStartDate: Date;
    bhpOptimizationStartDate: Date;
    skinFactorWells: number;
    trials: number;
    target: number;
    pressureVariance: number;
    optPeriod: number;
    saveOnlyBestO: boolean;
    mainOCount: number;
    sprintInitialsLength: number;
    sprintSkinFactorLength: number;
    sprintPermeabilitiesLength: number;
    minSkinFactor: number;
    maxSkinFactor: number;
    saveAllFrontTracking: boolean;
    oilErrorWeight: number;
    liquidErrorWeight: number;
    injectionErrorWeight: number;
    pressureErrorWeight: number;
    flowErrorWeight: number;
    pressureZabErrorWeight: number;
    watercutErrorWeight: number;

    usePredictionSkinFactors: boolean;

    /**
     * Количество итераций по оптимизации забойного давления в рамках шага оптимизации
     */
    iterationsBhp: number;

    /**
     * Количество итераций по оптимизации скин-фактора (ГТМ) в рамках шага оптимизации
     */
    iterationsGtm: number;

    /**
     * Необходимо ли адаптировать параметры регионов пластов
     */
    adaptRegions: boolean;

    /**
     * Необходимо ли адаптировать границы водонасыщенности межскважинных соединений
     */
    adaptSaturations: boolean;
}

export class CalculationTemplate {
    public scenarioId: number;

    public adaptations: number;

    public adaptationStart: Date;

    public adaptationEnd: Date;

    public predictionEnd: Date;

    public radius: number;

    public deadRadius: number;

    public searchAngle: number;

    public transmissibilitiesLimit: number;

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

    public saveOnlyBestA: boolean;

    public oilErrorTotalMAPE: number;

    public searchBestModel: boolean;

    public liqErrorTotalMAPE: number;

    public plastIds: number[];

    public period: number;

    public periodType: number;

    public modelCount: number;

    public lastUpdateDate: Date;

    /**
     * Дата начала поиска ГТМ (т.е. оптимизации скин-факторов в расчете)
     */
    public optimizeSkinFactorStartDate: Date;

    /**
     * Дата начала оптимизации забойных давлений
     */
    public optimizeBhpStartDate: Date;

    /**
     * Количество скважин, на которых возможно провести ГТМ в рамках одного шага оптимизации
     */
    skinFactorWells: number;

    public trials: number;

    public mainOCount: number;

    public target: number;

    public pressureVariance: number;

    public optPeriod: number;

    public saveOnlyBestO: boolean;

    public watercutLimit: number;

    public oilRateLimit: number;

    public minPressure: number;

    /**
     * Длина спринта адаптации скин-фактора (количество итераций)
     */
    public sprintSkinFactorLength: number;

    /**
     * Длина спринта адаптации геомодели (количество итераций)
     */
    public sprintInitialsLength: number;

    /**
     * Длина спринта адаптации проницаемостей (количество итераций)
     */
    public sprintPermeabilitiesLength: number;

    /**
     * Минимальное значение скин-фактора
     */
    public minSkinFactor: number;

    /**
     * Максимальное значение скин-фактора
     */
    public maxSkinFactor: number;

    /**
     * Сохранять данные насыщенности на все даты (фронт трекинг)
     */
    public saveAllFrontTracking: boolean;

    public oilErrorWeight: number;
    public liquidErrorWeight: number;
    public injectionErrorWeight: number;
    public pressureErrorWeight: number;
    public flowErrorWeight: number;
    public pressureZabErrorWeight: number;
    public watercutErrorWeight: number;

    public usePredictionSkinFactors: boolean;

    /**
     * Количество итераций по оптимизации забойного давления в рамках шага оптимизации
     */
    iterationsBhp: number;

    /**
     * Количество итераций по оптимизации скин-фактора (ГТМ) в рамках шага оптимизации
     */
    iterationsGtm: number;

    public static fromRaw(raw: ICalculationTemplate): CalculationTemplate {
        if (!raw) {
            return null;
        }

        let entity = new CalculationTemplate();

        entity.adaptations = raw.adaptations;
        entity.adaptationStart = new Date(raw.adaptationStart);
        entity.adaptationEnd = new Date(raw.adaptationEnd);
        entity.predictionEnd = isNil(raw.predictionEnd) ? null : new Date(raw.predictionEnd);

        entity.radius = Math.round(raw.radius);
        entity.deadRadius = Math.round(raw.deadRadius);
        entity.searchAngle = Math.round(raw.searchAngle);

        entity.transmissibilitiesLimit = round0(raw.transmissibilitiesLimit);
        entity.preVolumeLimit = round0(raw.preVolumeLimit);

        entity.reservesLimit = round0(raw.reservesLimit);
        entity.permeabilitiesLimit = round0(raw.permeabilitiesLimit);
        entity.adaptOilC1 = raw.adaptOilC1;
        entity.adaptOilC2 = raw.adaptOilC2;
        entity.adaptWaterC1 = raw.adaptWaterC1;
        entity.adaptWaterC2 = raw.adaptWaterC2;
        entity.adaptSaturations = raw.adaptSaturations;
        entity.adaptRegions = raw.adaptRegions;

        entity.saveOnlyBestA = raw.saveOnlyBestA;
        entity.searchBestModel = raw.searchBestModel;

        entity.scenarioId = raw.scenarioId;
        entity.liqErrorTotalMAPE = raw.liqErrorTotalMAPE;
        entity.oilErrorTotalMAPE = raw.oilErrorTotalMAPE;

        entity.plastIds = raw.plastIds;

        entity.period = raw.period;
        entity.periodType = raw.periodType;

        entity.modelCount = raw.modelCount;
        entity.watercutLimit = raw.watercutLimit;
        entity.oilRateLimit = raw.oilRateLimit;

        entity.lastUpdateDate = isNil(raw.lastUpdateDate) ? null : new Date(raw.lastUpdateDate);

        entity.usePredictionSkinFactors = raw.usePredictionSkinFactors;
        entity.skinFactorWells = raw.skinFactorWells;

        entity.optimizeSkinFactorStartDate =
            entity.adaptationEnd > new Date(raw.skinFactorOptimizationStartDate)
                ? addMonth(entity.adaptationEnd, 1)
                : new Date(raw.skinFactorOptimizationStartDate);
        entity.optimizeBhpStartDate =
            entity.adaptationEnd > new Date(raw.bhpOptimizationStartDate)
                ? addMonth(entity.adaptationEnd, 1)
                : new Date(raw.bhpOptimizationStartDate);

        entity.trials = raw.trials;
        entity.target = raw.target as OptimizationTargetEnum;
        entity.pressureVariance = raw.pressureVariance;
        entity.optPeriod = raw.optPeriod;
        entity.saveOnlyBestO = raw.saveOnlyBestO;
        entity.mainOCount = raw.mainOCount;
        entity.iterationsBhp = raw.iterationsBhp;
        entity.iterationsGtm = raw.iterationsGtm;

        entity.sprintInitialsLength = raw.sprintInitialsLength;
        entity.sprintSkinFactorLength = raw.sprintSkinFactorLength;

        entity.sprintInitialsLength = raw.sprintInitialsLength ?? 0;
        entity.sprintSkinFactorLength = raw.sprintSkinFactorLength ?? 0;
        entity.sprintPermeabilitiesLength = raw.sprintPermeabilitiesLength ?? 0;

        entity.minSkinFactor = raw.minSkinFactor;
        entity.maxSkinFactor = raw.maxSkinFactor;
        entity.saveAllFrontTracking = raw.saveAllFrontTracking;

        entity.oilErrorWeight = raw.oilErrorWeight;
        entity.liquidErrorWeight = raw.liquidErrorWeight;
        entity.injectionErrorWeight = raw.injectionErrorWeight;
        entity.pressureErrorWeight = raw.pressureErrorWeight;
        entity.flowErrorWeight = raw.flowErrorWeight;
        entity.pressureZabErrorWeight = raw.pressureZabErrorWeight;
        entity.watercutErrorWeight = raw.watercutErrorWeight;

        return entity;
    }
}
