import { CanvasSize, CanvasSizeRaw } from '../../entities/canvas/canvasSize';

export const convertCanvasSize = (v: CanvasSizeRaw): CanvasSize =>
    new CanvasSize(v.minX, v.minY, v.maxX, v.maxY, v.size);
