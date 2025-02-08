export interface CanvasSizeRaw {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    size: number;
}

export class CanvasSize {
    public readonly xMin: number;
    public readonly yMin: number;
    public readonly xMax: number;
    public readonly yMax: number;
    public readonly size: number;

    public constructor(xMin: number, yMin: number, xMax: number, yMax: number, size: number = 50) {
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
        this.size = size;
    }
}
