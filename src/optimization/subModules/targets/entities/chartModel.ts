export interface ChartModel {
    dt: Date;
    oilRate: number;
    liqRate: number;
    injection: number;
    isReal: boolean;
    oilRateForecast: number;
    liqRateForecast: number;
    injectionForecast: number;
}
