export interface AdaptationSummary {
    a: number;
    plastId: number;

    oil: AdaptationParameter;
    liquid: AdaptationParameter;

    injection: AdaptationParameter;
    pressure: AdaptationParameter;

    bottomHolePressure: AdaptationParameter;

    totalError: number;
}

export interface AdaptationParameter {
    calc: number;
    real: number;

    errorMAE: number;
    errorMAPE: number;
}
