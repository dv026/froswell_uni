import { WellTypeEnum } from '../enums/wellTypeEnum';

export class WellPointModel {
    public id: number;
    public type: WellTypeEnum;
    public cx: number;
    public cy: number;

    public constructor(id: number, x: number, y: number, type: WellTypeEnum) {
        this.id = id;
        this.type = type;
        this.cx = x;
        this.cy = y;
    }
}
