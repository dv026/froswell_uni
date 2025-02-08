/**
 * Режим INSIM расчета
 */
export enum CalculationModeEnum {
    /**
     * Улучшение существующей адаптации
     */
    Improvement = 1,

    /**
     * Прогноз
     */
    Prediction = 2,

    /**
     * Создание новой адаптации
     */
    Creation = 3,

    /**
     * Оптимизация прогноза
     */
    Optimization = 4
}

export const isImprovement = (mode: CalculationModeEnum): boolean => mode === CalculationModeEnum.Improvement;
export const isAdaptation = (mode: CalculationModeEnum): boolean =>
    mode === CalculationModeEnum.Creation || mode === CalculationModeEnum.Improvement;
export const isPrediction = (mode: CalculationModeEnum): boolean => !isAdaptation(mode);
export const isOptimization = (mode: CalculationModeEnum): boolean => mode === CalculationModeEnum.Optimization;
