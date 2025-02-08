import { defaultTo } from 'ramda';

import { getLabel as getUnitLabel, UnitsEnum as U } from '../../common/enums/unitsEnum';
import { commaFmt } from '../../common/helpers/parameters';
import { getBriefLabel as getParamLabel, WellLoggingEnum as P } from '../../input/enums/wellLoggingEnum';

type fmtT = (name: string, unit: string) => string;

const mp = (name: P, unit: U, fmt?: fmtT): string => defaultTo(commaFmt, fmt)(getParamLabel(name), getUnitLabel(unit));

export const tinyNeut = (name: P = P.NEUT, unit: U = U.ConvUnits, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyGr = (name: P = P.GR, unit: U = U.MicroroentgenHour, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinySp = (name: P = P.SP, unit: U = U.MV, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyGz3 = (name: P = P.GZ3, unit: U = U.OhmM, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyLld = (name: P = P.LLD, unit: U = U.OhmM, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyIld = (name: P = P.ILD, unit: U = U.OhmM, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyCali = (name: P = P.CALI, unit: U = U.Meter, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinySonic = (name: P = P.SONIC, unit: U = U.µsM, fmt?: fmtT): string => mp(name, unit, fmt);
export const tinyRhob = (name: P = P.RHOB, unit: U = U.MicroroentgenHour, fmt?: fmtT): string => mp(name, unit, fmt);
