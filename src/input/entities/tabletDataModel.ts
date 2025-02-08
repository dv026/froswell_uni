import { map, pipe, sortBy } from 'ramda';

import {
    TabletDownholeHistory,
    TabletLogging,
    TabletModel as InputTabletModel,
    TabletModelByPlast,
    TabletModelByWell,
    TabletPackerHistory,
    TabletPerforation,
    TabletResearchInflowProfile,
    TabletTrajectory
} from './tabletModel';

export class TabletModel {
    public top: number;
    public bottom: number;
    public topAbs: number;
    public bottomAbs: number;
    public avgVolume: number;
    public avgTransmissibility: number;
    public volumeWaterCutINSIM: number;
    public relLiqInje: number;
    public relLiqInjeAccum: number;
    public effectiveInjection: number;
    public wellId: number;
    public plastId: number;
}

export class ProxyTabletModel {
    public top: number;
    public bottom: number;
    public topAbs: number;
    public bottomAbs: number;
    public avgVolume: number;
    public avgTransmissibility: number;
    public volumeWaterCutINSIM: number;
    public relLiqInje: number;
    public relLiqInjeAccum: number;
    public effectiveInjection: number;
    public saturationType: number;
    public wellId: number;
    public plastId: number;
}

export class TabletEfficiencyModel {
    public dt: Date;
    public operationId: number;
    public operationName: string;
    public wellId: number;
    public plastId: number;
    public acidInjectionVolume: number;
    public emulsionInjectionVolume: number;
    public polyacrylamideInjectionVolume: number;
    public slurryInjectionVolume: number;
    public calciumchlorideInjectionVolume: number;
    public reagentInjectionVolume: number;
    public effectiveOilMonth: number;
    public minTopVolume: number;
    public maxBottomVolume: number;
    public minTopEffect: number;
    public maxBottomEffect: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw: any): TabletEfficiencyModel {
        const m: TabletEfficiencyModel = raw;
        m.dt = new Date(m.dt);

        return m;
    }
}

export class TabletDataModel {
    public data: Array<InputTabletModel>;
    public dataByPlasts: Array<TabletModelByPlast>;
    public dataByWells: Array<TabletModelByWell>;
    public perforation: Array<TabletPerforation>;
    public trajectories: Array<TabletTrajectory>;
    public wellLogging: Array<TabletLogging>;
    public researchInflowProfile: Array<TabletResearchInflowProfile>;
    public proxyData: Array<ProxyTabletModel>;
    public packerHistory: Array<TabletPackerHistory>;
    public efficiencyData: Array<TabletEfficiencyModel>;
    public downholeHistory: Array<TabletDownholeHistory>;

    constructor(data: any) {
        this.data = data.data;
        this.proxyData = data.proxyData;
        this.dataByPlasts = data.dataByPlasts;
        this.dataByWells = data.dataByWells;
        this.proxyData = data.proxyData;

        this.perforation = pipe(
            map(TabletPerforation.fromRaw),
            sortBy(x => x.top)
        )(data.perforation || []);

        this.trajectories = data.trajectories;
        this.wellLogging = data.wellLogging;
        this.researchInflowProfile = pipe(
            map(TabletResearchInflowProfile.fromRaw),
            sortBy(x => x.dt)
        )(data.researchInflowProfile || []);
        this.packerHistory = data.packerHistory;
        this.efficiencyData = map(TabletEfficiencyModel.fromRaw, data.efficiencyData || []);
        this.downholeHistory = data.downholeHistory;
    }
}
