export class PlastDistributionRaw {
    public dt: Date;
    public details: PlastDetailRaw[];
}

export interface PlastDetailRaw {
    plastId: number;
    plastName: string;
    perOil: number;
    perLiq: number;
    perInj: number;
    sumPlastOilRateINSIM: number;
    sumPlastLiqRateINSIM: number;
    sumPlastInjectionINSIM: number;
}
