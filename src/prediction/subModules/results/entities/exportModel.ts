export class ReportExportModel {
    public scenarioId: number;
    public subScenarioId: number;
    public productionObjectId: number;
    public plastId: number;
    public onlyInLicenseBorder: boolean;
    public dataType: ReportDataTypeEnum;
    public optimization: boolean;

    public constructor(
        scenarioId: number,
        subScenarioId: number,
        productionObjectId: number,
        plastId: number,
        onlyInLicenseBorder: boolean,
        dataType: ReportDataTypeEnum,
        optimization: boolean
    ) {
        this.scenarioId = scenarioId;
        this.subScenarioId = subScenarioId;
        this.productionObjectId = productionObjectId;
        this.plastId = plastId;
        this.onlyInLicenseBorder = onlyInLicenseBorder;
        this.dataType = dataType;
        this.optimization = optimization;
    }
}

export enum ReportDataTypeEnum {
    Adaptation = 1,
    Prediction = 2,
    AdaptationPlusPrediction = 3,
    Optimization = 4
}
