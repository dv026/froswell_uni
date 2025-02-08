import { MapSettingModel as PredictionMapSettingModel } from 'prediction/entities/mapSettingModel';

import { OperationDistributionModel } from './operationDistributionModel';

export class MapSettingModel extends PredictionMapSettingModel {
    public operationDistribution: OperationDistributionModel[];

    public constructor() {
        super();
    }
}
