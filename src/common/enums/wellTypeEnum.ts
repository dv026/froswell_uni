export enum WellTypeEnum {
    Oil = 1,
    Injection = 2,
    Mixed = 3,
    Piezometric = 4,
    Unknown = 9999
}

const is = (type: WellTypeEnum, x: WellTypeEnum): boolean => x === type;
export const isOil = (x: WellTypeEnum): boolean => is(x, WellTypeEnum.Oil);
export const isInj = (x: WellTypeEnum): boolean => is(x, WellTypeEnum.Injection);
