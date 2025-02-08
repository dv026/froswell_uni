import { nul } from 'common/helpers/ramda';
import { DownholeType } from 'input/enums/downholeType';
import { cond, equals, isNil, T } from 'ramda';

import { LithologyType } from '../../common/entities/lithologyType';
import { SaturationType } from '../../common/entities/saturationType';

export class TabletModel {
    public id: number;
    public top: number;
    public bottom: number;
    public topAbs: number;
    public bottomAbs: number;
    public porosity: number;
    public oilSaturation: number;
    public permeability: number;
    public wellId: number;
    public wellName: string;
    public plastId: number;
    public saturationTypeId: number;
    public saturationTypeName: string;
    public lithologyId: number;
    public lithologyName: string;
    public plastName: string;
    public productionObjectId: number;
    public productionObjectName: string;
    public perforationState: number;
}

export class TabletModelByPlast {
    public plastId: number;
    public plastName: string;
    public partPefroration: number;
    public permeability: number;
    public avgInflowProfile: number;
}

export class TabletModelByWell {
    public wellId: number;
    public wellName: string;
    public plastId: number;
    public plastName: string;
    public partPefroration: number;
    public permeability: number;
    public avgInflowProfile: number;
}

export class TabletViewModelByWell {
    public plastId: number;
    public wellId: number;
    public wellPlastName: string;
    public partPefroration: number;
    public permeability: number;
    public avgInflowProfile: number;
    public isClosed: boolean;
}

export class TabletPerforation {
    public id: number;
    public dt: Date;
    public top: number;
    public bottom: number;
    public topAbs: number;
    public bottomAbs: number;
    public closingDate: Date;
    public wellId: number;
    public wellName: string;
    public plastId: number;
    public plastName: string;
    public productionObjectId: number;
    public groupId: number;
    public grpState: boolean;
    public perforationType: string;
    public holes: number;
    public comments: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw: any): TabletPerforation {
        const tp: TabletPerforation = raw;
        tp.dt = new Date(tp.dt);
        tp.closingDate = !isNil(tp.closingDate) && new Date(tp.closingDate);

        return tp;
    }
}

export class TabletTrajectory {
    public wellId: number;
    public z: number;
    public zAbs: number;
}

export class TabletLogging {
    public wellId: number;
    public dept: number;
    public neut: number;
    public gr: number;
    public sp: number;
    public gz3: number;
    public lld: number;
    public ild: number;
    public cali: number;
    public sonic: number;
    public rhob: number;
}

export class TabletResearchInflowProfile {
    public dt: Date;
    public value: number;
    public top: number;
    public bottom: number;
    public wellId: number;
    public saturationTypeId: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw: any): TabletResearchInflowProfile {
        const tp: TabletResearchInflowProfile = raw;
        tp.dt = new Date(tp.dt);

        return tp;
    }
}

export class TabletSaturationColor {
    public type: SaturationType;
    public color: string;
}

export class TabletLithologyFill {
    public type: LithologyType;
    public fill: string;
}

export class TabletPackerHistory {
    public id: number;
    public startDate: Date;
    public closingDate: Date;
    public topPacker: number;
    public bottomPacker: number;
    public wellId: number;
    public filterBetweenPackers: boolean;
    public dividedEquipment: boolean;
    public hermeticState: boolean;
    public behindPipeInjection: boolean;
    public autonomousPipeLayout: boolean;
    public topPump: number;
    public pumpType: number;
    public pumpName: string;
}

export class TabletDownholeHistory {
    public id: number;
    public depth: number;
    public wellId: number;
    public downholeType: DownholeType;
    public dt: Date;
}
