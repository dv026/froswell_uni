export class IsolineModel {
    public step: number;
    public min: number;
    public max: number;

    public constructor(step: number, min: number, max: number) {
        this.step = step;
        this.min = min;
        this.max = max;
    }
}
