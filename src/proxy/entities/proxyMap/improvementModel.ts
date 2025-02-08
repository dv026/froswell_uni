export class ImprovementModel {
    public jobId: number;
    public scenarioId: number;
    public productionObjectId: number;
    public plastId: number;
    public aNumber: number;
    public maxDist: number;
    public distToContour: number;

    public constructor() {
        this.aNumber = 50;
        this.maxDist = 450;
        this.distToContour = 250;
    }
}
