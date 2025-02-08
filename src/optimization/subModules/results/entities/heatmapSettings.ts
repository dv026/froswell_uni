import { HeatmapRaw } from './heatMapRaw';
import { HeatmapAccumulatedRaw } from './heatmapAccumulatedRaw';
import { HeatmapGroupRaw } from './heatmapGroupRaw';

export class HeatmapSettings {
    data: HeatmapRaw[];
    oilAccumulated: HeatmapAccumulatedRaw[];
    injAccumulated: HeatmapAccumulatedRaw[];
    accumulatedByMainO: HeatmapAccumulatedRaw[];
    bestMainO: number;
    oilNames: string[];
    injNames: string[];
    oilGroups: HeatmapGroupRaw[];
    injGroups: HeatmapGroupRaw[];

    constructor() {
        this.data = [];
        this.oilAccumulated = [];
        this.injAccumulated = [];
        this.accumulatedByMainO = [];
        this.bestMainO = 0;
    }
}
