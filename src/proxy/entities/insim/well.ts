import * as R from 'ramda';
import { last, sort } from 'ramda';

import { div } from '../../../common/helpers/math';
import { sumBy } from '../../../common/helpers/ramda';
import { Nullable } from '../../../common/helpers/types';
import { isAquifer } from '../../helpers/utils';
import { ResultDataTypeEnum } from '../../subModules/calculation/enums/resultDataTypeEnum';
import { convert } from '../frontTracking/converter';
import { FrontTracking } from '../frontTracking/frontTracking';
import { FrontTrackingBoundaries } from '../frontTracking/frontTrackingBoundaries';

const adaptationFilterFn =
    () =>
    (x: AdaptationDateINSIM): boolean =>
        !R.isNil(x?.realProps);
const predictionFilterFn =
    () =>
    (x: AdaptationDateINSIM): boolean =>
        R.isNil(x?.realProps);

export const byAdaptationMode = (x: ResultDataTypeEnum): ((x: AdaptationDateINSIM) => boolean) =>
    R.cond([
        [R.equals(ResultDataTypeEnum.Adaptation), adaptationFilterFn],
        [R.equals(ResultDataTypeEnum.Prediction), predictionFilterFn],
        [R.T, () => () => true]
    ])(x);

export const forPlast = R.curry((plastId: number, x: AdaptationDateINSIM) =>
    plastId > 0 ? AdaptationDateINSIM.forPlast(x, plastId) : x
);

export class WellINSIM {
    public adaptations: Array<AdaptationINSIM>;

    public frontTracking: FrontTracking;

    public frontTrackingBoundaries: FrontTrackingBoundaries[];

    public predictionStart: Date;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): WellINSIM {
        let well = new WellINSIM();

        if (!!raw) {
            well.adaptations = R.map(AdaptationINSIM.fromRaw, raw.adaptations);
            well.predictionStart = !!raw.predictionStart ? new Date(raw.predictionStart) : null;
            well.frontTracking = convert(raw.frontTracking);
            well.frontTrackingBoundaries = raw.frontTrackingBoundaries;
        }

        return well;
    }
}

export class PropsINSIM {
    public plastId: number;
    public liqRate: number;
    public oilRate: number;
    public injection: number;
    public watercut: number;
    public pressure: number;
    public effectiveInjection: number;
    public bottomHolePressure: number;
    public accumLiqRate: number;
    public accumOilRate: number;
    public accumInjection: number;
    public skinFactor: number;
    public repairName: string;
    public repairNameInjection: string;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): PropsINSIM {
        let p = new PropsINSIM();

        p.plastId = raw.plastId;
        p.liqRate = raw.liqRate;
        p.oilRate = raw.oilRate;
        p.injection = raw.injection;
        p.watercut = raw.watercut;
        p.pressure = raw.pressure;
        p.effectiveInjection = raw.effectiveInjection;
        p.bottomHolePressure = raw.bottomHolePressure;
        p.bottomHolePressure = raw.bottomHolePressure;
        p.accumLiqRate = raw.accumLiqRate;
        p.accumOilRate = raw.accumOilRate;
        p.accumInjection = raw.accumInjection;
        p.skinFactor = raw.skinFactor;
        p.repairName = raw.repairName;
        p.repairNameInjection = raw.repairNameInjection;

        return p;
    }

    public static createEmpty(): PropsINSIM {
        let p = new PropsINSIM();

        p.plastId = 0;
        p.liqRate = 0;
        p.oilRate = 0;
        p.injection = 0;
        p.watercut = 0;
        p.pressure = 0;
        p.effectiveInjection = 0;
        p.accumLiqRate = 0;
        p.accumOilRate = 0;
        p.accumInjection = 0;

        return p;
    }
}

export class AdaptationDateINSIM {
    public calculatedProps: PropsINSIM[];
    public realProps: PropsINSIM[];

    public date: Date;

    public neighbors: Array<NeighborINSIM>;

    public plastProps: Array<PlastProperties>;

    public bestOil: boolean;

    public bestPressure: boolean;

    public isInj(): boolean {
        return this.isPrediction()
            ? R.any(x => x.injection > 0, this.calculatedProps)
            : R.any(x => x.injection > 0, this.realProps);
    }

    public isOil(): boolean {
        return this.isPrediction()
            ? R.any(x => x.liqRate > 0, this.calculatedProps)
            : R.any(x => x.liqRate > 0, this.realProps);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): AdaptationDateINSIM {
        let d = new AdaptationDateINSIM();

        d.calculatedProps = R.sortBy(x => x.plastId, R.map(PropsINSIM.fromRaw, raw.calculatedProps));

        // realProps равны null в том случае, если сущность AdaptationDateINSIM - прогнозная
        d.realProps = R.isNil(raw.realProps)
            ? null
            : R.sortBy(x => x.plastId, R.map(PropsINSIM.fromRaw, raw.realProps));
        d.date = new Date(raw.date);
        d.neighbors = R.sortBy(x => x.id, R.map(NeighborINSIM.fromRaw, raw.neighbors));

        d.plastProps = [];
        for (let i = 0; i < raw.neighbors.length; i++) {
            if (R.any(x => x.plastId === raw.neighbors[i].plastId, d.plastProps)) {
                continue;
            }

            d.plastProps.push(new PlastProperties(raw.neighbors[i].plastId, raw.neighbors[i].effectiveInjection));
        }

        d.plastProps = R.sort(x => x.plastId, d.plastProps);
        d.plastProps.forEach(x => {
            x.effectiveInjection = R.find(cp => cp.plastId === x.plastId, d.calculatedProps)?.effectiveInjection;
        });

        d.bestOil = raw.bestOil;
        d.bestPressure = raw.bestPressure;

        return d;
    }

    public static forPlast(raw: AdaptationDateINSIM, plastId: number): AdaptationDateINSIM {
        let d = new AdaptationDateINSIM();

        d.calculatedProps = R.filter(x => x.plastId === plastId, raw.calculatedProps);
        d.realProps = R.isNil(raw.realProps) ? null : R.filter(x => x.plastId === plastId, raw.realProps);
        d.date = raw.date;
        d.neighbors = R.filter(x => x.plastId === plastId, raw.neighbors);
        d.plastProps = R.filter(x => x.plastId === plastId, raw.plastProps);

        return d;
    }

    private isPrediction(): boolean {
        return R.isNil(this.realProps);
    }
}

export class PlastProperties {
    public plastId: number;

    public effectiveInjection: number;

    public constructor(id: number, inj: number) {
        this.plastId = id;
        this.effectiveInjection = inj;
    }
}

export class AdaptationINSIM {
    public id: number;

    public dates: Array<AdaptationDateINSIM>;

    public initialTransmissibilities: Array<InitialTransmissibility>;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): AdaptationINSIM {
        let a = new AdaptationINSIM();

        a.id = raw.id;
        a.dates = R.map(
            AdaptationDateINSIM.fromRaw,
            R.sortBy(x => x.date, raw.dates)
        );
        a.initialTransmissibilities = R.map(InitialTransmissibility.fromRaw, raw.initialTransmissibilities);

        return a;
    }

    public static forPlast(raw: AdaptationINSIM, plastId: number): AdaptationINSIM {
        let a = new AdaptationINSIM();

        a.id = raw.id;
        a.dates = R.sortBy(
            x => x.date,
            R.map(y => AdaptationDateINSIM.forPlast(y, plastId), raw.dates)
        );
        a.initialTransmissibilities = R.filter(x => x.plastId === plastId, raw.initialTransmissibilities);

        return a;
    }

    public defaultNeighbors(): NeighborINSIM[] {
        return last(sort(x => x.neighbors.length, this.dates)).neighbors;
    }
}

export class InitialTransmissibility {
    public id: number;

    public type: NeighborTypeEnum;

    public plastId: number;

    public wellId: number;

    public before: number;

    public after: number;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): InitialTransmissibility {
        let p = new InitialTransmissibility();

        p.plastId = raw.plastId;
        p.wellId = raw.wellId;
        p.type = InitialTransmissibility.convertWellIdToType(raw.wellId);
        p.id = parseInt(`${raw.wellId}${raw.plastId}`);
        p.before = raw.before;
        p.after = raw.after;

        return p;
    }

    private static convertWellIdToType(wellId: number) {
        switch (wellId) {
            case 0:
                return NeighborTypeEnum.Underwater;
            case 1:
                return NeighborTypeEnum.Sector1;
            case 2:
                return NeighborTypeEnum.Sector2;
            case 3:
                return NeighborTypeEnum.Sector3;
            case 4:
                return NeighborTypeEnum.Sector4;
            case 5:
                return NeighborTypeEnum.Sector5;
            case 6:
                return NeighborTypeEnum.Sector6;
            default:
                return NeighborTypeEnum.Well;
        }
    }
}

export class NeighborINSIM {
    public transmissibility: number;

    public flowRate: number;

    public flowRateWater: number;

    public volume: number;

    public waterSaturation: number;

    public fbl: number;

    public dfbl: number;

    public type: NeighborTypeEnum;

    public plastId: number;

    public wellId: number;

    /**
     * Комбинация ид: тип соседа + wellId соседа + plastId соседа
     */
    public id: number;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): NeighborINSIM {
        let well = new NeighborINSIM();

        well.flowRate = raw.flowRate;
        well.flowRateWater = raw.flowRateWater;
        well.transmissibility = raw.transmissibility;
        well.type = raw.neighborType;
        well.waterSaturation = raw.waterSaturation;
        well.fbl = raw.fbl;
        well.dfbl = raw.dfbl;
        well.volume = raw.volume;

        well.plastId = raw.plastId;
        well.wellId = raw.wellId;
        well.id = isAquifer(well.type)
            ? parseInt(`${well.type}${well.wellId}${well.plastId}`)
            : parseInt(`${well.wellId}${well.plastId}`);

        return well;
    }
}

export enum NeighborTypeEnum {
    Underwater = 1,
    Sector1 = 2,
    Sector2 = 3,
    Sector3 = 4,
    Sector4 = 5,
    Sector5 = 6,
    Sector6 = 7,
    Well = 8
}

export const sumCalcLiqRate = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.liqRate, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const sumRealLiqRate = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.liqRate, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const sumCalcOilRate = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.oilRate, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const sumRealOilRate = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.oilRate, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const sumCalcInjection = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.injection, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const sumRealInjection = (state: AdaptationDateINSIM): number =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.injection, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const sumCalcLiqRateAccum = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.accumLiqRate, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const avgRealLiqRateAccum = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.accumLiqRate, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const sumCalcOilRateAccum = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.accumOilRate, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const avgRealOilRateAccum = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.accumOilRate, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const sumCalcInjectionAccum = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.sum(R.map((y: PropsINSIM) => y.accumInjection, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const avgRealInjectionAccum = (state: AdaptationDateINSIM): number =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.accumInjection, x)))(
        R.isNil(state) ? null : state.realProps
    );

export const avgRealWatercut = (state: AdaptationDateINSIM): number =>
    R.pipe(
        R.map<PropsINSIM, number>(y => y.watercut),
        R.mean
    )(state?.realProps ?? [PropsINSIM.createEmpty()]);

export const avgCalcWatercut = (state: AdaptationDateINSIM): number =>
    watercutFromLiqrate(state?.calculatedProps ?? [PropsINSIM.createEmpty()]);

const watercutFromLiqrate = (props: PropsINSIM[]) =>
    div(
        sumBy(x => x.liqRate * x.watercut, props),
        sumBy(x => x.liqRate, props)
    );

export const avgCalcPressure = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.pressure, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const avgRealPressure = (state: AdaptationDateINSIM): Nullable<number> => {
    if (R.isNil(state) || R.isNil(state.realProps)) {
        return null;
    }

    return R.ifElse(
        R.any((y: PropsINSIM) => !R.isNil(y.pressure)),
        x => R.mean(R.map((y: PropsINSIM) => y.pressure, x)),
        () => null
    )(state.realProps);
};

export const noRealPressure = (state: AdaptationDateINSIM): boolean => {
    if (R.isNil(state) || R.isNil(state.realProps)) {
        return true;
    }

    return R.all(
        R.isNil,
        R.map(x => x.pressure, state.realProps)
    );
};

export const avgCalcPressureBottomHole = (state: AdaptationDateINSIM): Nullable<number> => {
    // TIP: забойное давление отображается только по отдельному пласту, поэтому нет необходимости аггрегировать значения
    if (!state?.calculatedProps || state?.calculatedProps.length < 1) {
        return null;
    }

    return state.calculatedProps[0].bottomHolePressure;
};

export const avgRealPressureBottomHole = (state: AdaptationDateINSIM): Nullable<number> => {
    // TIP: забойное давление отображается только по отдельному пласту, поэтому нет необходимости аггрегировать значения
    if (!state?.realProps || state?.realProps.length < 1) {
        return null;
    }

    return state.realProps[0].bottomHolePressure;
};

export const calcWatercut = (state: AdaptationDateINSIM): Nullable<number> => {
    if (R.isNil(state)) {
        return null;
    }

    return div(
        R.reduce((acc, p) => acc + p.liqRate * p.watercut, 0, state.calculatedProps || []),
        R.reduce((acc, p) => acc + p.liqRate, 0, state.calculatedProps || [])
    );
};

export const avgCalcSkinFactor = (state: AdaptationDateINSIM): Nullable<number> =>
    R.ifElse(R.isNil, R.always(null), x => R.mean(R.map((y: PropsINSIM) => y.skinFactor, x)))(
        R.isNil(state) ? null : state.calculatedProps
    );

export const getRepairName = (state: AdaptationDateINSIM, byPlast: boolean): Nullable<string> =>
    R.ifElse(R.isNil, R.always(null), x =>
        byPlast
            ? R.head(R.map((y: PropsINSIM) => y.repairName, x))
            : R.uniq(R.map((y: PropsINSIM) => y.repairName, x))
                  .filter(Boolean)
                  .join(',') || null
    )(R.isNil(state) ? null : state.realProps);

export const getRepairNameInjection = (state: AdaptationDateINSIM, byPlast: boolean): Nullable<string> =>
    R.ifElse(R.isNil, R.always(null), x =>
        byPlast
            ? R.head(R.map((y: PropsINSIM) => y.repairNameInjection, x))
            : R.uniq(R.map((y: PropsINSIM) => y.repairNameInjection, x))
                  .filter(Boolean)
                  .join(',') || null
    )(R.isNil(state) ? null : state.realProps);
