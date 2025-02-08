export interface FrontTracking {
    wellId: number;

    neighbors: NeighborFrontTracking[];
}

export interface NeighborFrontTracking {
    neighborWellId: number;

    plastId: number;

    dates: DateSaturation[];
}

export interface DateSaturation {
    date: Date;

    flowRate: number;

    byDistance: DistanceSaturation[];
}

export interface MinLDateSaturation {
    date: Date;

    saturation: DistanceSaturation;
}

export interface DistanceSaturation {
    frontSaturation: number;

    x: number;

    y: number;

    l: number;

    flow: number;
}

export interface SaturationOnDate {
    l: number;

    flow: number;

    date: Date;

    frontSaturation: number;
}
