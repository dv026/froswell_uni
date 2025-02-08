import { ChartModel } from './chartModel';
import { TargetOptionModel } from './targetOptionModel';

export interface ModuleModel {
    chartData: ChartModel[];
    targetZones: TargetOptionModel[];
}
