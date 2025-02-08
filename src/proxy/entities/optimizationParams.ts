import { OptimizationTargetEnum } from '../../common/enums/optimizationTargetEnum';

export class OptimizationParams {
    /**
     * Дата начала оптимизации скин-факторов
     */
    optimizeSkinFactorStartDate: Date;

    /**
     * Дата начала оптимизации забойных давлений
     */
    optimizeBhpStartDate: Date;

    /**
     * Количество скважин, на которых возможно провести ГТМ в рамках одного шага оптимизации
     */
    skinFactorWells: number;

    /**
     * Количество прогнозных моделей
     */
    modelCount: number;

    /**
     * Количество вариантов в каждой модели
     */
    trials: number;

    /**
     * Целевая функции оптимизации
     */
    target: OptimizationTargetEnum;

    /**
     * Допустимое изменение забойного давления
     */
    pressureVariance: number;

    /**
     * Шаг оптимизации (в месяцах)
     */
    period: number;

    /**
     * Сохранять только лучшие параметры оптимизации
     */
    saveOnlyBestO: boolean;

    /**
     * Использовать ли скин-факторы, заданные для прогнозного расчета
     */
    usePredictionSkinFactors: boolean;

    /**
     * Количество итераций по оптимизации забойного давления в рамках шага оптимизации
     */
    iterationsBhp: number;

    /**
     * Количество итераций по оптимизации скин-фактора (ГТМ) в рамках шага оптимизации
     */
    iterationsGtm: number;
}
