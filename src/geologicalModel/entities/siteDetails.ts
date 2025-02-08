import { KeyValue } from '../../common/entities/keyValue';
import { WellBrief } from '../../common/entities/wellBrief';
import { KrigingCalcSettingsModel } from '../../input/entities/krigingCalcSettings';

export class SiteDetails {
    info: WellBrief;
    plastId: number;
    plasts: KeyValue[];
    krigingSettings: KrigingCalcSettingsModel;

    constructor() {
        this.krigingSettings = new KrigingCalcSettingsModel();
    }
}
