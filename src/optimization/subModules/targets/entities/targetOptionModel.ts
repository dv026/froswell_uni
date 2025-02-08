export interface TargetOptionModel {
    id: number;
    scenarioId: number;
    subScenarioId: number;
    plastId: number;
    wellId: number;
    type: number;
    minDate: Date;
    maxDate: Date;
    minValue: number;
    maxValue: number;
}
