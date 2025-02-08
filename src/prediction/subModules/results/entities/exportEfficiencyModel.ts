export class ReportExportEfficiencyModel {
    public scenarioId: number;
    public subScenarioId: number;
    public productionObjectId: number;
    public plastId: number;
    public wellId: number;
    public optimization: boolean;

    public constructor(
        scenarioId: number,
        subScenarioId: number,
        productionObjectId: number,
        plastId: number,
        wellId: number,
        optimization: boolean
    ) {
        this.scenarioId = scenarioId;
        this.subScenarioId = subScenarioId;
        this.productionObjectId = productionObjectId;
        this.plastId = plastId;
        this.wellId = wellId;
        this.optimization = optimization;
    }
}
