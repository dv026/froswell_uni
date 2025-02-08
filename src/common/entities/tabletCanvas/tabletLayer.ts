import { CanvasSize } from '../canvas/canvasSize';
import { InitTabletModel, TabletModel } from './tabletModel';

export interface TabletLayer {
    canvasSize?: CanvasSize;

    initLayer?(model?: InitTabletModel): void;
    equals?(other: TabletLayer): boolean;
    render(mapModel: TabletModel): void;
    onClick?(point: number[]): void;
    onDoubleClick?(point: number[]): void;
    onTooltipMouseMove?(point: number[]): string;
    clone?(): TabletLayer;
}
