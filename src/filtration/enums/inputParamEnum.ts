export enum InputParamEnum {
    OilTonnesRate = 'oilTonnesRate' /* Дебит нефти */,
    LiquidVolumeRate = 'liquidVolumeRate' /* Дебит жидкости, м³/сут */,
    WatercutVolume = 'watercutVolume' /* Обводненность, % */,
    BottomHolePressure = 'pressureZab' /*Забойное давление, атм*/,
    InjectionRate = 'injectionRate' /* Закачка (нагнетательная)*/,

    OilTonnesRateOld = 'oilTonnesRateOld' /* Дебит нефти */,
    LiquidVolumeRateOld = 'liquidVolumeRateOld' /* Дебит жидкости, м³/сут */,
    WatercutVolumeOld = 'watercutVolumeOld' /* Обводненность, % */,
    BottomHolePressureOld = 'pressureZabOld' /*Забойное давление, атм*/,
    InjectionRateOld = 'injectionRateOld' /* Закачка (нагнетательная)*/
}

export type ChartParams =
    | 'All'
    | InputParamEnum.LiquidVolumeRate
    | InputParamEnum.OilTonnesRate
    | InputParamEnum.WatercutVolume
    | InputParamEnum.BottomHolePressure
    | InputParamEnum.InjectionRate;
