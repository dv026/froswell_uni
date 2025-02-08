import * as R from 'ramda';

import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { degToRad } from '../../common/helpers/geometry';
import { radarAngle } from '../helpers/utils';

export interface NeighborModelRaw {
    angle: number;
    avgPorosity: number;
    charworkId: number;
    distance: number;
    id: number;
    name: string;
    plastId: number;
    wellId: number;
}

export class NeighborModel {
    /**
     * Угол в радианах
     */
    public angle: number;

    /**
     * Угол в градусах
     */
    public angleDegree: number;

    public avgPorosity: number;

    /**
     * Расстояние от центра
     */
    public distance: number;

    /**
     * Ид скважины-соседа (ид скважины + ид пласта)
     */
    public id: number;

    /**
     * Ид скважины
     */
    public wellId: number;

    /**
     * Ид пласта
     */
    public plastId: number;

    public name: string;

    public type: WellTypeEnum;

    public static fromRaw(raw: NeighborModelRaw): NeighborModel {
        let model = new NeighborModel();

        model.angleDegree = radarAngle(raw.angle);
        model.angle = degToRad(model.angleDegree - 90);
        model.distance = raw.distance;
        model.id = raw.id;
        model.name = !R.isNil(raw.name) ? raw.name : `[${raw.wellId}]`;
        model.type = raw.charworkId;
        model.avgPorosity = raw.avgPorosity;
        model.wellId = raw.wellId;
        model.plastId = raw.plastId;
        model.type = raw.charworkId;

        return model;
    }
}
