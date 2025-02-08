export enum ChartCompareEnum {
    Sum = null, // Суммарный
    Multiple = -1, // Сравнение скважин
    OilRate = 1, // Дебит нефти
    LiquidOrInjectionRate = 2, // Дебит жидкости/Закачка воды
    GasVolumeRate = 3, // Дебит газа
    WatercutVolume = 4, // Объемная обводненность
    WatercutWeight = 5, // Весовая обводненность
    PressureRes = 6, // Пластовое давление
    PressureZab = 7, // Забойное давление
    AccumOilProduction = 8, // Накопленная добыча нефти
    AccumLiquidProduction = 9, // Накопленная добыча жидкости
    AccumGasVolumeProduction = 10, // Накопленная закачка газа
    AccumInjection = 11 // Накопленная закачка воды,
}
