export class PermeabilityParams {
    public optimizeBL: boolean;
    public plastId: number;
    public stepSize: number;
    public tests: number[];

    public constructor() {
        this.optimizeBL = false;
        this.plastId = 0;
        this.stepSize = 0.01;
        this.tests = [1];
    }
}
