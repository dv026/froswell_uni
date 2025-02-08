export class OptimisationRange {
    public value: number;
    public min: number;
    public max: number;

    public constructor(value: number, min: number, max: number) {
        this.value = value;
        this.min = min;
        this.max = max;
    }
}
