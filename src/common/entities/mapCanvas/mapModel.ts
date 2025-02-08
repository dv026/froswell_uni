// TODO: типизация
import { CanvasSize } from '../canvas/canvasSize';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MapModel {
    context: any;
    transform: any;
    canvasSize: CanvasSize;
    width: number;
    height: number;
    cursorPoint: number[];
    isMinimap: boolean;
    isExport: boolean;
}

export interface InitMapModel {
    scale?: number;
    selection: any;
    update: () => void;
    initZoomBehavior: () => void;
}
