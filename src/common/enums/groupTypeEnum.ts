import { equals } from 'ramda';

export enum GroupTypeEnum {
    Properties = 1,
    Structure = 2,
    Development = 3
}

export const isExpanded = (g: GroupTypeEnum, current: GroupTypeEnum): boolean => equals(g, current);
