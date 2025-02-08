import { Point } from 'common/entities/canvas/point';

export interface InputMapContourModel {
    productionObjectId: number;
    plastId: number;
    contourTypeId: number;
    contourId: number;
    polygon: Point[];
    interpolation: number;
}
