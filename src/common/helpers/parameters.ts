import { always, defaultTo, ifElse, pipe } from 'ramda';

import { getLabel as getParamLabel, ParamNameEnum as P } from '../enums/paramNameEnum';
import { getLabel as getUnitLabel, UnitsEnum as U } from '../enums/unitsEnum';

type fmtT = (name: string, unit: string) => string;

export const commaFmt = (name: string, unit: string): string =>
    pipe(
        ifElse(
            x => !!x,
            x => `, ${x}`,
            always('')
        ),
        x => `${name}${x}`
    )(unit);

export const bracketFmt = (name: string, unit: string): string => `${name} (${unit})`;
export const spaceFmt = (name: string, unit: string): string => `${name} ${unit}`;

const mp = (name: P, unit: U, fmt?: fmtT): string => defaultTo(commaFmt, fmt)(getParamLabel(name), getUnitLabel(unit));

export const liqrate = (name: P = P.LiqRate, unit: U = U.M3PerDay, fmt?: fmtT): string => mp(name, unit, fmt);
export const liqProduction = (unit: U = U.M3PerMonth, fmt?: fmtT): string => mp(P.LiqProduction, unit, fmt);
export const oilProduction = (unit: U = U.TonsPerMonth, fmt?: fmtT): string => mp(P.OilProduction, unit, fmt);
export const oilrate = (name: P = P.OilRate, unit: U = U.TonsPerDay, fmt?: fmtT): string => mp(name, unit, fmt);
export const watercut = (name: P = P.WatercutVolume, unit: U = U.Percent, fmt?: fmtT): string => mp(name, unit, fmt);
export const watercutWeight = (name: P = P.WatercutWeight, unit: U = U.Percent, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const gasVolumeRate = (name: P = P.GasVolumeRate, unit: U = U.ThousandM3PerDay, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const pressureZab = (name: P = P.PressureZab, unit: U = U.Atm, fmt?: fmtT): string => mp(name, unit, fmt);
export const pressureZabOil = (name: P = P.PressureZabOil, unit: U = U.Atm, fmt?: fmtT): string => mp(name, unit, fmt);
export const pressureZabInjection = (name: P = P.PressureZabInjection, unit: U = U.Atm, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const pressureRes = (name: P = P.PressureRes, unit: U = U.Atm, fmt?: fmtT): string => mp(name, unit, fmt);
export const injectionRate = (name: P = P.InjectionRate, unit: U = U.M3PerDay, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const dynLevel = (name: P = P.DynLevel, unit: U = U.Meter, fmt?: fmtT): string => mp(name, unit, fmt);
export const transmissibility = (name: P = P.Transmissibility, unit: U = U.M3DayPa, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const fbl = (name: P = P.Fbl, unit: U = U.None, fmt?: fmtT): string => mp(name, unit, fmt);
export const skinFactor = (name: P = P.SkinFactor, unit: U = U.None, fmt?: fmtT): string => mp(name, unit, fmt);
export const accumulatedOilProduction = (
    name: P = P.AccumulatedOilProduction,
    unit: U = U.TonsAccumulated,
    fmt?: fmtT
): string => mp(name, unit, fmt);
export const accumulatedLiqRate = (name: P = P.AccumulatedLiqRate, unit: U = U.M3Accumulated, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const accumulatedInjectionRate = (
    name: P = P.AccumulatedInjectionRate,
    unit: U = U.M3Accumulated,
    fmt?: fmtT
): string => mp(name, unit, fmt);
export const accumulatedGasVolumeProduction = (
    name: P = P.AccumulatedGasVolumeProduction,
    unit: U = U.M3Accumulated,
    fmt?: fmtT
): string => mp(name, unit, fmt);
export const absDepth = (name: P = P.AbsDepth, unit: U = U.Meter, fmt?: fmtT): string => mp(name, unit, fmt);
export const saturation = (name: P = P.Saturation, unit: U = U.None, fmt?: fmtT): string => mp(name, unit, fmt);
export const perforation = (name: P = P.Perforation, unit: U = U.None, fmt?: fmtT): string => mp(name, unit, fmt);
export const lithology = (name: P = P.Lithology, unit: U = U.None, fmt?: fmtT): string => mp(name, unit, fmt);
export const porosity = (name: P = P.Porosity, unit: U = U.Percent, fmt?: fmtT): string => mp(name, unit, fmt);
export const permeability = (name: P = P.Permeability, unit: U = U.MDarcy, fmt?: fmtT): string => mp(name, unit, fmt);
export const oilSaturation = (name: P = P.OilSaturation, unit: U = U.Percent, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const initialPressure = (name: P = P.InitialPressure, unit: U = U.Atm, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const bubblePointPressure = (name: P = P.BubblePointPressure, unit: U = U.Atm, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const initialWaterSaturation = (name: P = P.InitialWaterSaturation, unit: U = U.Units, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const residualOilSaturation = (name: P = P.ResidualOilSaturation, unit: U = U.Units, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const geologicalReserves = (name: P = P.GeologicalReserves, unit: U = U.MillionTons, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const viscosity = (name: P = P.Viscosity, unit: U = U.MPaSec, fmt?: fmtT): string => mp(name, unit, fmt);
export const conversionFactor = (name: P = P.ConversionFactor, unit: U = U.Units, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const compressibility = (name: P = P.Compressibility, unit: U = U.MPaMinus, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const density = (name: P = P.Density, unit: U = U.GCm3, fmt?: fmtT): string => mp(name, unit, fmt);
export const perforatedPower = (name: P = P.PerforatedPower, unit: U = U.Percent, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const averageInflowProfile = (name: P = P.AverageInflowProfile, unit: U = U.Percent, fmt?: fmtT): string =>
    mp(name, unit, fmt);
export const aquifer = (name: P = P.Aquifer, unit: U = U.M3Accumulated, fmt?: fmtT): string => mp(name, unit, fmt);
export const accumulatedOutFlux = (name: P = P.AccumulatedOutFlux, unit: U = U.M3Accumulated, fmt?: fmtT): string =>
    mp(name, unit, fmt);

export const packerHistory = (name: P = P.AverageInflowProfile, unit: U = U.None, fmt?: fmtT): string =>
    mp(name, unit, fmt);
