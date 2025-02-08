import { CanvasSize } from '../canvas/canvasSize';

const rate = 20;
const minimapMaxWidth = 120;
const minimapMaxHeight = 450;

export const defaultCanvasSize = 25;
export const wellRadius = 1;

export class CommonCanvasTablet {
    public canvasSize: CanvasSize;

    public constructor(cs: CanvasSize) {
        this.canvasSize = cs;
    }

    public cx = (x: number): number => x;

    public cy = (y: number): number => y;

    public invertX = (x: number): number => x;

    public invertY = (y: number): number => y;

    public invertPoint = (val: number[]): number[] => [Math.round(val[0]), Math.round(val[1])];

    public cWidth = (): number => this.canvasSize.xMax - this.canvasSize.xMin;

    public cHeight = (): number => this.canvasSize.yMax - this.canvasSize.yMin;

    public cCenterX = (): number => this.cx(this.canvasSize.xMin + (this.canvasSize.xMax - this.canvasSize.xMin) / 2);

    public cCenterY = (): number => this.cy(this.canvasSize.yMin + (this.canvasSize.yMax - this.canvasSize.yMin) / 2);

    public containsPoint = (rect: number[], point: number[]): boolean =>
        rect[0] <= point[0] && point[0] <= rect[0] + rect[2] && rect[1] <= point[1] && point[1] <= rect[1] + rect[3];

    public containsPointAd = (rect: number[], point: number[]): boolean =>
        rect[0] <= point[0] && point[0] <= rect[2] && rect[1] <= point[1] && point[1] <= rect[3];

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
