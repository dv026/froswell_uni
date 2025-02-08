export interface WithDate {
    dt: Date;
}

export class MerState implements WithDate {
    public charWorkId: number;
    public compensation: number;
    public dt: Date;
    public dt2: number;
    public gasVolumeRate: number;
    public injectionRate: number;
    public liquidVolumeRate: number;
    public oilFieldId: number;
    public oilTonnesRate: number;
    public pressureRes: number;
    public pressureZab: number;
    public pressureZabOil: number;
    public pressureZabInjection: number;
    public productionObjectId: number;
    public sumGasProductionVolumeMonth: number;
    public sumInjectionMonth: number;
    public sumLiquidProductionTonnesMonth: number;
    public sumLiquidProductionVolumeMonth: number;
    public sumNakGasVolumeProductionMonth: number;
    public sumNakInjectionMonth: number;
    public sumNakLiquidProductionTonnesMonth: number;
    public sumNakOilProductionTonnesMonth: number;
    public sumOilProductionTonnesMonth: number;
    public sumWaterProductionVolumeMonth: number;
    public watercutVolume: number;
    public watercutWeight: number;
    public repairName: number;
    public repairNameInjection: number;
    public wellsInWork: number;
}
