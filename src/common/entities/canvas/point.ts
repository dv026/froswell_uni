export interface IPoint {
    x: number;
    y: number;
}

export class Point implements Point {
    public readonly x: number;
    public readonly y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
