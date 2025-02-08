import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import mainDict from '../helpers/i18n/dictionary/main.json';

export enum UnitsEnum {
    Atm,
    ConvUnits,
    GCm3,
    M3Accumulated,
    M3DayPa,
    M3PerDay,
    M3PerMonth,
    MDarcy,
    Meter,
    MicroroentgenHour,
    MillionTons,
    MPaMinus,
    MPaSec,
    MV,
    None,
    OhmM,
    Percent,
    ThousandM3PerDay,
    ThousandM3PerMonth,
    TonsAccumulated,
    TonsPerDay,
    TonsPerMonth,
    Units,
    µsM
}

export const getLabel = (param: UnitsEnum): string =>
    cond([
        [equals(UnitsEnum.Atm), always(i18n.t(mainDict.common.units.atm))],
        [equals(UnitsEnum.ConvUnits), always(i18n.t(mainDict.common.units.convUnits))],
        [equals(UnitsEnum.GCm3), always(i18n.t(mainDict.common.units.gCm3))],
        [equals(UnitsEnum.M3Accumulated), always(i18n.t(mainDict.common.units.m3Accumulated))],
        [equals(UnitsEnum.M3DayPa), always(i18n.t(mainDict.common.units.m3DayPa))],
        [equals(UnitsEnum.M3PerDay), always(i18n.t(mainDict.common.units.m3PerDay))],
        [equals(UnitsEnum.M3PerMonth), always(i18n.t(mainDict.common.units.m3PerMonth))],
        [equals(UnitsEnum.MDarcy), always(i18n.t(mainDict.common.units.mDarcy))],
        [equals(UnitsEnum.Meter), always(i18n.t(mainDict.common.units.meter))],
        [equals(UnitsEnum.MicroroentgenHour), always(i18n.t(mainDict.common.units.microroentgenHour))],
        [equals(UnitsEnum.MillionTons), always(i18n.t(mainDict.common.units.millionTons))],
        [equals(UnitsEnum.MPaMinus), always(i18n.t(mainDict.common.units.mPaMinus))],
        [equals(UnitsEnum.MPaSec), always(i18n.t(mainDict.common.units.mPaSec))],
        [equals(UnitsEnum.MV), always(i18n.t(mainDict.common.units.mV))],
        [equals(UnitsEnum.OhmM), always(i18n.t(mainDict.common.units.ohmM))],
        [equals(UnitsEnum.Percent), always(i18n.t(mainDict.common.units.percent))],
        [equals(UnitsEnum.ThousandM3PerDay), always(i18n.t(mainDict.common.units.thousandM3PerDay))],
        [equals(UnitsEnum.ThousandM3PerMonth), always(i18n.t(mainDict.common.units.thousandM3PerMonth))],
        [equals(UnitsEnum.TonsAccumulated), always(i18n.t(mainDict.common.units.tonsAccumulated))],
        [equals(UnitsEnum.TonsPerDay), always(i18n.t(mainDict.common.units.tonsPerDay))],
        [equals(UnitsEnum.TonsPerMonth), always(i18n.t(mainDict.common.units.tonsPerMonth))],
        [equals(UnitsEnum.Units), always(i18n.t(mainDict.common.units.units))],
        [equals(UnitsEnum.µsM), always(i18n.t(mainDict.common.units.µsM))],
        [T, always('')]
    ])(param);
