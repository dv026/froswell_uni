import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { WellGroupItem } from '../../calculation/entities/wellGroupItem';
import { CalculationModeEnum } from '../../calculation/enums/calculationModeEnum';
import { ParamDate } from '../../common/entities/paramDate';
import { ParamDateOrig } from '../../common/entities/paramDateOrig';
import { Range } from '../../common/entities/range';
import { ProxyListWell } from '../../common/entities/wellModel';
import { WellINSIM } from '../entities/insim/well';
import { InsimCalculationParams } from '../entities/insimCalculationParams';
import { NeighborModel } from '../entities/neighborModel';
import { PlastModel, PlastModelBrief } from '../entities/plastModel';
import { ObjectReport } from '../entities/report/objectReport';
import { WellReport } from '../entities/report/wellReport';
import { CalculationTemplate, WellDetailsModel } from '../entities/wellDetailsModel';

export interface UpdateScenariosPayload {
    current: number;
    scenarios: ScenarioModel[];

    // список скважин с обновленными значениями сценариев
    list?: ProxyListWell[];
}

export interface UpdateSubScenariosPayload {
    current: number;
    scenarios: ScenarioModel[];

    // список скважин с обновленными значениями сценариев
    list?: ProxyListWell[];
}

export interface GoToPermeabilitiesPayload {
    plasts: PlastModelBrief[];
    wells: WellGroupItem[];
}

export interface UpdateDynamicPayload {
    oilRateDynamic: ParamDate[];
    oilRateDiffDynamic: ParamDateOrig[];
}

export interface LoadWellPayload {
    adaptationRange?: Range<Date>;
    clearCalculationItems: boolean;
    templates?: CalculationTemplate[];
    templateNew?: CalculationTemplate;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sublayers: any[];
    well: WellDetailsModel;
    report: ObjectReport | WellReport;
}

export interface InsimCoefficientsPayload {
    plasts: PlastModel[];
    neighbors: NeighborModel[];
    data: WellINSIM;
}

export interface ChangeScenarioPayload {
    scenarioId: number;
    params: [CalculationModeEnum, InsimCalculationParams][];
}
