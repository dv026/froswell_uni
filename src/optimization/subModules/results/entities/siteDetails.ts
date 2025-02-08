import { PlastModel } from 'common/entities/plastModel';

import { WellBrief } from '../../../../common/entities/wellBrief';
import { DataModeEnum } from '../enums/dataModeEnum';
import { DateResults } from './dateResults';

export interface SiteDetails {
    bestMainO: number;
    dataMode: DataModeEnum;
    dynamic: DateResults[];
    info: WellBrief;
    kind: SiteKindEnum;
    plastId: number;
    plasts: PlastModel[];
}

export interface SiteInfo {
    wellId: number;
    subScenarioId: number;
    scenarioId: number;
    productionObjectId: number;
    oilfieldId: number;
}

export enum SiteKindEnum {
    Well = 1,
    SubScenario = 2,
    Scenario = 3
}
