import i18n from 'i18next';
import { always, cond, includes, T } from 'ramda';

import { GridMapEnum } from '../../common/enums/gridMapEnum';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const scaleMeasure = (type: GridMapEnum): string =>
    cond([
        [
            x => includes(x, [GridMapEnum.Power, GridMapEnum.TopAbs, GridMapEnum.BottomAbs, GridMapEnum.CurrentPower]),
            always(i18n.t(dict.common.units.meter))
        ],
        [
            x =>
                includes(x, [
                    GridMapEnum.Porosity,
                    GridMapEnum.OilSaturation,
                    GridMapEnum.SWL,
                    GridMapEnum.SWCR,
                    GridMapEnum.SOWCR
                ]),
            always(i18n.t(dict.common.units.units))
        ],
        [x => includes(x, [GridMapEnum.Permeability]), always('mD')],
        [x => includes(x, [GridMapEnum.PressureZab]), always(i18n.t(dict.common.units.atm))],
        [
            x => includes(x, [GridMapEnum.LiqRateVariation, GridMapEnum.InjectionRateVariation]),
            always(i18n.t(dict.common.units.m3PerDay))
        ],
        [x => includes(x, [GridMapEnum.OilRateVariation]), always(i18n.t(dict.common.units.tonsPerDay))],
        [x => includes(x, [GridMapEnum.VolumeWaterCutVariation]), always(i18n.t(dict.common.units.percent))],
        [x => includes(x, [GridMapEnum.PressureZabVariation]), always(i18n.t(dict.common.units.atm))],
        [x => includes(x, [GridMapEnum.MultiplePressureLiqRate]), always(i18n.t(dict.common.units.atm))],
        [T, always('')]
    ])(type);
