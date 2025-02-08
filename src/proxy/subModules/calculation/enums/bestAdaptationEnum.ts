export enum BestAdaptationEnum {
    ByOil = 1,
    ByPressure = 2
}

export const isBestByOil = (x: BestAdaptationEnum): boolean => x === BestAdaptationEnum.ByOil;
