import { ScenarioModel } from 'calculation/entities/scenarioModel';
import { PlastModel } from 'common/entities/plastModel';
import { WellBrief } from 'common/entities/wellBrief';
import { WellTypeEnum } from 'common/enums/wellTypeEnum';

import { DateResults } from './dateResults';

export interface SiteDetails {
    dynamic: DateResults[];
    info: WellBrief;
    plastId: number;
    plasts: PlastModel[];
    scenarios: ScenarioModel[];
    wellType: WellTypeEnum;
}
