import { equals } from 'ramda';

export enum OptimisationParamEnum {
    PresureZab = 1,
    SkinFactor = 2
}

export const isPressureZab = (value: OptimisationParamEnum): boolean => equals(OptimisationParamEnum.PresureZab, value);
export const isSkinFactor = (value: OptimisationParamEnum): boolean => equals(OptimisationParamEnum.SkinFactor, value);
