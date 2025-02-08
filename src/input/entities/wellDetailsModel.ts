import { KeyValue } from '../../common/entities/keyValue';

export class WellDetailsModel {
    public id: number;
    public oilFieldId: number;
    public prodObjId: number;
    public charWorkId: number;
    public prodObjDict: Array<KeyValue>;
    public charWorkDict: Array<KeyValue>;
}

export class DayState {
    public date: Date;
    public gas: number;
    public liquid: number;
    public oil: number;

    public constructor(date: Date, gas: number, liquid: number, oil: number) {
        this.date = date;
        this.gas = gas;
        this.liquid = liquid;
        this.oil = oil;
    }
}
