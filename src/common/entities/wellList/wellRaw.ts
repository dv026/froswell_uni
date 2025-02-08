class WellRaw {
    public id: number;
    public name: string;
    public oilFieldId: number;
    public oilFieldName: string;
    public productionObjectId: number;
    public productionObjectName: string;
    public hasOil: boolean;
    public hasInj: boolean;
    public charWorkId: number;
    public charWorkName: number;
    public favorite: boolean;
    public horisontState: boolean;
    public efficiency: boolean;
}

export class WellWithRecordsRaw extends WellRaw {
    public stateWell: number;
    public variations: number;
}
