export enum NoteLevel {
    Info = 1,
    Warning = 2,
    Error = 3
}

export enum NoteCode {
    InterwellPorosityNotSet = 1000,
    InterwellPermeabilityNotSet = 1001,
    InterwellOilSaturatedThicknessNotSet = 1002,

    RegionRockCompressibilityIncorrect = 2000,
    RegionWaterCompressibilityIncorrect = 2001,
    RegionOilCompressibilityIncorrect = 2002,
    RegionVolumeIncorrect = 2003,

    WellAssociatedWithSeveralRegions = 3000,
    WellHasNoSpecifiedBHP = 3001,

    PlastOilSaturationMapDuplicatePoints = 4000,
    PlastOilSaturationMapDuplicatePointsWithDifferentValues = 4001,
    PlastOilSaturationMapIsEmpty = 4002
}

export interface InterwellSign {
    wellId: number;
    neighborId: number;
    plastId: number;
}

export interface WellSign {
    wellId: number;
    plastId: number;
}

export interface PlastSign {
    plastId: number;
}

export interface RegionSign {
    id: number;
    plastId: number;
}

export type Sign = InterwellSign | WellSign | PlastSign | RegionSign;

export interface Note {
    code: NoteCode;

    level: NoteLevel;

    target: Sign;

    message?: string;
}
