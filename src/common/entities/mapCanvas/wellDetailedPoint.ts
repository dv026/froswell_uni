import { isNil, map, sortBy } from 'ramda';

import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { CharworkPeriod } from './charworkPeriod';

export class WellDetailedPoint {
    public id: number;
    public x: number;
    public y: number;
    public x2: number;
    public y2: number;
    public name: string;
    public plastId: number;
    public isImaginary: boolean;
    public isIntermediate: boolean;
    public isDrilledFoundation: boolean;
    public typeHistory?: Array<CharworkPeriod>;
    public trajectories?: number[][];

    public get type(): WellTypeEnum {
        if (this.typeHistory && this.typeHistory.length > 0) {
            return this.typeHistory[this.typeHistory.length - 1].type;
        }

        return null;
    }

    public get lastWellType(): CharworkPeriod {
        if (this.typeHistory && this.typeHistory.length > 0) {
            return this.typeHistory[this.typeHistory.length - 1];
        }

        return null;
    }

    public constructor(
        id: number,
        x: number,
        y: number,
        x2: number,
        y2: number,
        name = null,
        plastId = null,
        typeHistory = [],
        isImaginary: boolean = false,
        isIntermediate: boolean = false,
        isDrilledFoundation: boolean = false,
        trajectories: number[][] = null
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;
        this.name = isNil(name) ? id.toString() : name;
        this.plastId = plastId;
        this.isImaginary = isImaginary;
        this.isIntermediate = isIntermediate;
        this.isDrilledFoundation = isDrilledFoundation;

        this.typeHistory = sortBy(x => x.startDate, map(CharworkPeriod.fromRaw, typeHistory || []));

        this.trajectories = trajectories;
    }
}
