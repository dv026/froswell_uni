import { Point } from '../../common/entities/canvas/point';

export interface CopyCharworkModel {
    sourceScenarioId: number;
    targetScenarioId: number;
    sourceSubScenarioId: number;
    targetSubScenarioId: number;
    plastId: number;
    allPlasts: boolean;
    polygon: Point[];
    copyPresureZab: boolean;
    copySkinfactor: boolean;
}
