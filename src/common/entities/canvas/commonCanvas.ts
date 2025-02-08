import { CanvasSize } from './canvasSize';

const rate = 20;
const minimapMaxWidth = 120;
const minimapMaxHeight = 250;

export const defaultCanvasSize = 10;
export const wellRadius = 1;

export class CommonCanvas {
    public canvasSize: CanvasSize;
    public canvasScale: number;

    public constructor(cs: CanvasSize) {
        this.canvasSize = cs;
        this.canvasScale = 1;
    }

    public setCanvasScale = (value: number) => {
        this.canvasScale = value ?? 1;
    };

    public cx = (x: number): number => (x - this.canvasSize.xMin) / rate;

    public cy = (y: number): number => Math.abs(y - this.canvasSize.yMax) / rate;

    public invertX = (x: number): number => this.canvasSize.xMin + x * rate;

    public invertY = (y: number): number => this.canvasSize.yMax - y * rate;

    public invertPoint = (val: number[]): number[] => [
        Math.round(this.invertX(val[0])),
        Math.round(this.invertY(val[1]))
    ];

    public cWidth = (): number => (this.canvasSize.xMax - this.canvasSize.xMin) / rate;

    public cHeight = (): number => (this.canvasSize.yMax - this.canvasSize.yMin) / rate;

    public cCenterX = (): number => this.cx(this.canvasSize.xMin + (this.canvasSize.xMax - this.canvasSize.xMin) / 2);

    public cCenterY = (): number => this.cy(this.canvasSize.yMin + (this.canvasSize.yMax - this.canvasSize.yMin) / 2);

    public cSize = (): number =>
        this.canvasSize.size !== undefined && this.canvasSize.size ? this.canvasSize.size : defaultCanvasSize;

    public gridX = (x: number): number => (x - this.canvasSize.xMin) / this.cSize();

    public gridY = (y: number): number => Math.abs(y - this.canvasSize.yMax) / this.cSize();

    public gridWidth = (): number => (this.canvasSize.xMax - this.canvasSize.xMin) / this.cSize();

    public gridHeight = (): number => (this.canvasSize.yMax - this.canvasSize.yMin) / this.cSize();

    public minimapProps = (): number[] => {
        const w = Math.abs(this.canvasSize.xMax - this.canvasSize.xMin);
        const h = Math.abs(this.canvasSize.yMax - this.canvasSize.yMin);

        const ratio = w / h;

        let miniatureWidth = minimapMaxWidth;
        let miniatureHeight = miniatureWidth / ratio;

        if (miniatureHeight > minimapMaxHeight) {
            miniatureHeight = minimapMaxHeight;
            miniatureWidth = miniatureHeight * ratio;
        }

        return [miniatureWidth, miniatureHeight];
    };
}
