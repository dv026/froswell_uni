import { WellTypeEnum } from '../enums/wellTypeEnum';
import { KeyValue } from './keyValue';

export class WellModel {
    public id?: number;
    public name: string;
    public oilFieldId: number;
    public oilFieldName: string;
    public productionObjectId: number;
    public productionObjectName: string;
    public charWorkId: number;
    public charWorkName: number;
    public type: WellTypeEnum;
    public prodObjDict: KeyValue[];
    public charWorkDict: KeyValue[];

    public scenarioId?: number;
    public scenarioName?: string;
    public subScenarioId?: number;
    public subScenarioName?: string;

    public variations: number;
    public state: number;

    public favorite: boolean;
    public horisontState: boolean;

    public efficiency: boolean;
}

export const makeAbstractWell = (name: string, id: number = -1): WellModel => {
    const w = new WellModel();
    w.id = id;
    w.name = name;

    return w;
};

export interface ListWell {
    id?: number;
    name: string;
    oilFieldId: number;
    oilFieldName: string;
    productionObjectId: number;
    productionObjectName: string;
    charWorkId: number;
    charWorkName: number;
    type: WellTypeEnum;
    prodObjDict: KeyValue[];
    charWorkDict: KeyValue[];
    favorite: boolean;
    optState: number;
    horisontState: boolean;
    efficiency: boolean;
}

export interface WithAdaptation {
    scenarioId?: number;
    scenarioName?: string;
}

export interface WithPrediction {
    subScenarioId?: number;
    subScenarioName?: string;
}

export interface WithVirual {
    isVirtual: boolean;
}

export interface ProxyListWell extends ListWell, WithAdaptation, WithVirual {
    oilError: number;
}

export interface PredictionListWell extends ListWell, WithAdaptation, WithPrediction, WithVirual {
    oil: number;
    oilError: number;
    water: number;
}

export interface RecordedListWell extends ListWell {
    variations: number;
    state: number;
}
