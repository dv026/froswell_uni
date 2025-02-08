import { WellSetupModel } from './wellSetupModel';
import { WellSetupRaw } from './wellSetupRaw';

export interface ModuleModel {
    setups: WellSetupRaw[];
    saved: WellSetupModel[];
}
