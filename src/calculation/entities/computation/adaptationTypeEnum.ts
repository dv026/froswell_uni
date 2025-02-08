/**
 * Описывает типы адаптации.
 * TIP: enum должен быть идентичен перечислению в Teics.Robot.Modules.Insim.Entities.Adaptation/AdaptationTypeEnum
 */
export enum AdaptationTypeEnum {
    /**
     * Адаптация параметров геологической модели
     */
    GeoModel = 1,

    /**
     * Адаптация параметров скин-факторов
     */
    SkinFactor = 2,

    /**
     * Адаптация не происходит, рассчитывается усредненная модель
     */
    Ensemble = 3,

    /**
     * Адаптация ОФП
     */
    Permeabilities = 4
}
