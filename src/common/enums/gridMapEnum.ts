export enum GridMapEnum {
    None = '',
    CalculationMode = 'calculation_mode',
    Power = '1', // 'Карта начальных нефтенасыщенных толщин'
    Porosity = '2', // 'Карта пористости'
    Permeability = '3', // 'Карта проницаемости'
    OilSaturation = '4', // 'Карта начальной нефтенасыщенности'
    TopAbs = '5', // 'Карта кровли пласта'
    BottomAbs = '6', // 'Карта подошвы пласта'
    PressureZab = '7', // 'Карта забойного давления'
    CurrentPower = '8', // 'Карта текущих нефтенасыщенных толщин'
    SWL = '9', // Связанная водонасыщенность
    SWCR = '10', // Критическая водонасыщенность
    SOWCR = '11', // Остаточная нефтенасыщенность

    InitialTransmissibilityBeforeAdaptation = '101', // КАРТА МЕЖСКВАЖИННЫХ ПРОВОДИМОСТЕЙ (ДО АДАПТАЦИИ)
    InitialTransmissibilityAfterAdaptation = '102', // КАРТА МЕЖСКВАЖИННЫХ ПРОВОДИМОСТЕЙ (ПРОКСИ-МОДЕЛЬ)
    Pressure = '103', // КАРТА ПЛАСТОВОГО ДАВЛЕНИЯ
    VolumeWaterCut = '104', // КАРТА НЕФТЕНАСЫЩЕННОСТИ
    InitialInterwellVolumeAfterAdaptation = '105', // Карта межскважинных объемов (прокси модель)
    InitialInterwellVolumeBeforeAdaptation = '106', // Карта межскважинных объемов (до адаптации)
    SWLAdaptation = '107', // Связанная водонасыщенность (адаптация)
    SOWCRAdaptation = '108', // Остаточная нефтенасыщенность (адаптация)
    CurrentOilSaturatedThickness = '109', // Карта текущих нефтенасыщенных толщин
    CurrentKH = '110', // Карта текущего КН
    CurrentK = '111', // Карта текущего К
    SkinFactor = '112', // Карта скин-фактора
    InitialSaturationAdaptation = '113', // Нефтенасыщенность (адаптация)

    LiqRateVariation = '1001',
    OilRateVariation = '1002',
    VolumeWaterCutVariation = '1003',
    InjectionRateVariation = '1004',
    PressureZabVariation = '1005',
    MultiplePressureLiqRate = '1006'
}
