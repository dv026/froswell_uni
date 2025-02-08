import { CanvasSize } from '../../canvas/canvasSize';
import { MapModel, InitMapModel } from './../mapModel';

export interface MapLayer {
    canvasSize?: CanvasSize;

    initLayer?(model?: InitMapModel): void;
    equals?(other: MapLayer): boolean;
    render(mapModel: MapModel): void;
    onClick?(point: number[]): void;
    onDoubleClick?(point: number[]): void;
}
