import { WellBrief } from '../../entities/wellBrief';

export enum RosterItemEnum {
    Oilfield = 1,
    ProductionObject = 2,
    Scenario = 3,
    SubScenario = 4,
    Well = 5
}

export enum MarkEnum {
    Empty = 0,
    Insim = 1,
    Summ = 2,
    SummInsim = 3,
    StateStopped = 10,
    StateActive = 11,
    VariationsNegative = 20,
    VariationsPositive = 21,
    VariationsEmpty = 22
}

export type WellRecord = WithWellType & WithMarks;

export interface WithWellType {
    type: number;
    favorite: boolean;
    horisontState: boolean;
}

export interface WithMarks {
    marks: MarkEnum[];
}

interface WeightParams {
    percent: number;
    value: number;
}

export interface WithWeights {
    weights: {
        oil: WeightParams;
        water: WeightParams;
    };
}

export interface WithVirtual {
    isVirtual: boolean;
}

export interface PredictionParams extends WithWeights, WithWellType, WithVirtual {
    oilError: number;
}

export interface Item<T> {
    name: string;
    id: WellBrief;
    type: RosterItemEnum;
    subs?: Item<T>[];
    attributes?: T;
    selected?: boolean;
    expanded?: boolean;
    readonly?: boolean;
    hidden?: boolean;
    allowChecked?: boolean;
    multipleSelection?: boolean;
    onClick?: (id: WellBrief) => void;
    onCheckbox?: (item: WellBrief, checked: boolean, type: RosterItemEnum) => void;
    onExpand?: (id: WellBrief, expanded: boolean) => void;
}
