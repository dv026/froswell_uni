export class Rect {
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    public readonly fill?: string;

    public constructor(x: number, y: number, width: number, height: number, fill?: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fill = fill;
    }
}
