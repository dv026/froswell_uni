// TODO: типизация
import { ScaleLinear } from 'd3-scale';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';

import { CanvasSize } from '../canvas/canvasSize';
import { WellBrief } from '../wellBrief';
import { ModelPictures } from './baseTablet';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TabletModel {
    context: any;
    transform: any;
    canvasSize: CanvasSize;
    width: number;
    height: number;
    cursorPoint: number[];
    isMinimap: boolean;
    isExport: boolean;
}

export interface InitTabletModel {
    well: WellBrief;
    model: TabletDataModel;
    previousModel: TabletDataModel;
    settings: TabletSettingsModel;
    columns: TabletColumn[];
    canvasSize: CanvasSize;
    absTop: number;
    absBottom: number;
    selection: any;
    scaleY: ScaleLinear<number, number, never>;
    trajectoryScale: ScaleLinear<number, number, never>;
    images: ModelPictures;
    cx: (x: number) => number;
    cy: (y: number) => number;
    update: () => void;
    initZoomBehavior: () => void;
    initLayers: () => void;
}
