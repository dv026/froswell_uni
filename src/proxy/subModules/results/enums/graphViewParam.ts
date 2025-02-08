import i18n from 'i18next';

import { DropdownOption } from '../../../../common/components/dropdown/dropdown';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export enum GraphViewParam {
    Common = 'common',
    Saturation = 'saturation',
    Watercut = 'watercut',
    Pressure = 'pressure',
    Liquid = 'liqrate',
    Oilrate = 'oilrate',
    PressureBottomHole = 'pressureBottomHole',
    Injection = 'injection',
    SkinFactor = 'skinfactor',
    Transmissibility = 'transmissibility',
    Fbl = 'fbl',
    PlastDistributionPercent = 'plastDistributionPercent',
    PlastDistribution = 'plastDistribution',
    ReserveDevelopment = 'reserveDevelopment',
    RelativePermeability = 'relativePermeability',
    WaterRateSource = 'waterRateSource',
    LiqRateSource = 'liqRateSource',
    AccumOilPlanFact = 'accumOilPlanFact',
    LiquidBalance = 'liquidBalance'
}

export const creationOpts = (): DropdownOption[] => [
    new DropdownOption(GraphViewParam.Common, i18n.t(dict.proxy.baseParams)),
    new DropdownOption(GraphViewParam.Saturation, i18n.t(dict.common.params.saturation)),
    new DropdownOption(GraphViewParam.Watercut, i18n.t(dict.common.params.watercutVolume)),
    new DropdownOption(GraphViewParam.Pressure, i18n.t(dict.common.params.pressureRes)),
    new DropdownOption(GraphViewParam.Liquid, i18n.t(dict.common.params.liqRate)),
    new DropdownOption(GraphViewParam.Oilrate, i18n.t(dict.common.params.oilRate)),
    new DropdownOption(GraphViewParam.PressureBottomHole, i18n.t(dict.common.params.pressureZab)),
    new DropdownOption(GraphViewParam.Injection, i18n.t(dict.common.params.injectionRate)),
    new DropdownOption(GraphViewParam.SkinFactor, i18n.t(dict.common.params.skinFactor)),
    new DropdownOption(GraphViewParam.Transmissibility, i18n.t(dict.common.params.transmissibility)),
    new DropdownOption(GraphViewParam.Fbl, 'f(S)'),
    new DropdownOption(GraphViewParam.PlastDistributionPercent, i18n.t(dict.common.distributionBy.plastPercent)),
    new DropdownOption(GraphViewParam.PlastDistribution, i18n.t(dict.common.distributionBy.plast)),
    new DropdownOption(GraphViewParam.ReserveDevelopment, i18n.t(dict.calculation.reserveDevelopment)),
    new DropdownOption(GraphViewParam.WaterRateSource, i18n.t(dict.calculation.waterRateSource)),
    new DropdownOption(GraphViewParam.LiqRateSource, i18n.t(dict.calculation.liqRateSource))
];

export const creationOptsByObject = (): DropdownOption[] => [
    new DropdownOption(GraphViewParam.Common, i18n.t(dict.proxy.baseParams)),
    new DropdownOption(GraphViewParam.Watercut, i18n.t(dict.common.params.watercutVolume)),
    new DropdownOption(GraphViewParam.Pressure, i18n.t(dict.common.params.pressureRes)),
    new DropdownOption(GraphViewParam.Liquid, i18n.t(dict.common.params.liqRate)),
    new DropdownOption(GraphViewParam.Oilrate, i18n.t(dict.common.params.oilRate)),
    new DropdownOption(GraphViewParam.PressureBottomHole, i18n.t(dict.common.params.pressureZab)),
    new DropdownOption(GraphViewParam.Injection, i18n.t(dict.common.params.injectionRate)),
    new DropdownOption(GraphViewParam.SkinFactor, i18n.t(dict.common.params.skinFactor)),
    new DropdownOption(GraphViewParam.PlastDistributionPercent, i18n.t(dict.common.distributionBy.plastPercent)),
    new DropdownOption(GraphViewParam.PlastDistribution, i18n.t(dict.common.distributionBy.plast)),
    new DropdownOption(GraphViewParam.ReserveDevelopment, i18n.t(dict.calculation.reserveDevelopment)),
    new DropdownOption(GraphViewParam.RelativePermeability, i18n.t(dict.calculation.relativePermeability)),
    new DropdownOption(GraphViewParam.AccumOilPlanFact, i18n.t(dict.calculation.accumOilPlanFact)),
    new DropdownOption(GraphViewParam.LiquidBalance, i18n.t(dict.calculation.liquidBalance))
];
