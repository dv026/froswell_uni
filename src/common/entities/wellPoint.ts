import { equals, isNil } from 'ramda';

import { WellTypeEnum } from '../enums/wellTypeEnum';
import { Point } from './canvas/point';
import { Interaction } from './interaction';

const isType = (x: WellPoint, type: WellTypeEnum): boolean => equals(x.type, type);
export const isOil = (x: WellPoint): boolean => isType(x, WellTypeEnum.Oil);
export const isInj = (x: WellPoint): boolean => isType(x, WellTypeEnum.Injection);
export const isImaginary = (x: WellPoint): boolean => isType(x, WellTypeEnum.Unknown);

/**
 * Определяет тип точки скважины, получаемую с серверной стороны
 */
export interface WellPointRaw {
    wellId: number;
    plastId: number;
    x: number;
    y: number;
}

export class WellPoint extends Point {
    public id: number;
    public name: string;
    public type: WellTypeEnum;

    public constructor(id: number, x: number, y: number, type: WellTypeEnum, name = null) {
        super(x, y);

        this.id = id;
        this.name = isNil(name) ? id?.toString() : name;
        this.type = type;
    }
}

export class WellPointDonut extends WellPoint {
    public donut: Donut;
    public grpState: number;
    public trajectories: number[][];
    public plastId: number;
    public plastName: string;
    public plastNumber: number;

    public constructor(
        id: number,
        x: number,
        y: number,
        type: WellTypeEnum,
        name = null,
        grpState: number = 0,
        donut: Donut = null,
        trajectory: number[][] = null,
        plastId: number = null,
        plastName: string = null,
        plastNumber: number = null
    ) {
        super(id, x, y, type, name);

        this.grpState = grpState;
        this.donut = donut;
        this.trajectories = trajectory;

        this.plastId = plastId;
        this.plastName = plastName;
        this.plastNumber = plastNumber;
    }
}

export class WellPointWithPlast extends WellPoint {
    public plastId: number;

    public constructor(id: number, x: number, y: number, type: WellTypeEnum, plastId = null, name = null) {
        super(id, x, y, type, name);
        this.plastId = plastId;
    }

    public static fromRaw(raw: WellPointRaw): WellPointWithPlast {
        return new WellPointWithPlast(raw.wellId, raw.x, raw.y, WellTypeEnum.Unknown, raw.plastId);
    }
}

export class OilWellPoint extends WellPointDonut {
    public horizontal?: Array<Point>;

    public constructor(
        id: number,
        x: number,
        y: number,
        name = null,
        horizontal = [],
        grpState: number,
        donut: Donut = null,
        trajectory: number[][] = null,
        plastId: number = null,
        plastName: string = null,
        plastNumber: number = null
    ) {
        super(id, x, y, WellTypeEnum.Oil, name, grpState, donut, trajectory, plastId, plastName, plastNumber);

        this.horizontal = horizontal;
        this.id = id;
        this.name = isNil(name) ? id.toString() : name;
    }
}

export class InjWellPoint extends WellPointDonut {
    public effectiveInjection: number;
    public horizontal?: Array<Point>;
    public interactions: Array<Interaction>;

    public constructor(
        id: number,
        x: number,
        y: number,
        name = null,
        horizontal = [],
        interactions: Array<Interaction> = [],
        grpState: number,
        effectiveInjection: number,
        donut: Donut = null,
        trajectories: number[][] = null,
        plastId: number = null,
        plastName: string = null,
        plastNumber: number = null
    ) {
        super(id, x, y, WellTypeEnum.Injection, name, grpState, donut, trajectories, plastId, plastName, plastNumber);

        this.effectiveInjection = effectiveInjection;
        this.horizontal = horizontal;
        this.interactions = interactions;
    }
}

export class DrilledWellPoint extends WellPointDonut {
    public horizontal?: Array<Point>;

    public constructor(
        id: number,
        x: number,
        y: number,
        name = null,
        horizontal = [],
        trajectories: number[][] = null
    ) {
        super(id, x, y, WellTypeEnum.Oil, name, null, null, trajectories);

        this.horizontal = horizontal;
    }
}

export class ImgWellPoint extends WellPointDonut {
    public constructor(id: number, x: number, y: number, name = null) {
        super(id, x, y, WellTypeEnum.Oil, name);

        this.id = id;
        this.name = isNil(name) ? id.toString() : name;
    }
}

export class Donut {
    public p2: number;
    public p3: number;

    public p2Accumulated: number;
    public p3Accumulated: number;
    public p4Accumulated: number;
    public oilRadius: number;
    public injRadius: number;
    public perfPercentage: number;
    public liquidRadiusNatural: number;
    public injectionRadiusNatural: number;

    public constructor(
        p2: number,
        p3: number,
        p2Accumulated: number,
        p3Accumulated: number,
        p4Accumulated: number,
        oilRadius: number,
        injRadius: number,
        perfPercentage: number,
        liquidRadiusNatural: number = null,
        injectionRadiusNatural: number = null
    ) {
        this.p2 = p2;
        this.p3 = p3;

        this.p2Accumulated = p2Accumulated;
        this.p3Accumulated = p3Accumulated;
        this.p4Accumulated = p4Accumulated;
        this.oilRadius = oilRadius;
        this.injRadius = injRadius;
        this.perfPercentage = perfPercentage;
        this.liquidRadiusNatural = liquidRadiusNatural;
        this.injectionRadiusNatural = injectionRadiusNatural;
    }
}
