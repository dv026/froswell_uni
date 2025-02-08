import { isNil, map, sortBy } from 'ramda';

import { Point } from '../../../common/entities/canvas/point';
import { WellTypeEnum } from '../../../common/enums/wellTypeEnum';
import { isNullOrEmpty } from '../../../common/helpers/ramda';

export class WellPoint {
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
    public typeHistory?: Array<ImaginaryCharWorkHistory>;
    public trajectories?: number[][];
    public plastNames?: string;

    public get type(): WellTypeEnum {
        if (this.typeHistory && this.typeHistory.length > 0) {
            return this.typeHistory[this.typeHistory.length - 1].type;
        }

        if (this.isDrilledFoundation && this.isEmptyTypeHistory) {
            return WellTypeEnum.Unknown; // todo mb
        }

        return null;
    }

    public get lastWellType(): ImaginaryCharWorkHistory {
        if (this.typeHistory && this.typeHistory.length > 0) {
            return this.typeHistory[this.typeHistory.length - 1];
        }

        return null;
    }

    public get isEmptyTypeHistory(): boolean {
        if (isNullOrEmpty(this.typeHistory)) {
            return true;
        }

        return this.typeHistory[0].isEmpty;
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
        trajectories: number[][] = null,
        plastNames: string = null
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

        this.typeHistory = sortBy(x => x.startDate, map(ImaginaryCharWorkHistory.fromRaw, typeHistory || []));

        this.trajectories = trajectories;

        this.plastNames = plastNames;
    }

    public static createWell(maxId: number, point: Point, plastId: number): WellPoint {
        return new WellPoint(
            maxId,
            point.x,
            point.y,
            null,
            null,
            null,
            plastId,
            [new ImaginaryCharWorkHistory()],
            true
        );
    }

    public static copyFrom(item: WellPoint): WellPoint {
        return new WellPoint(
            item.id,
            item.x,
            item.y,
            item.x2,
            item.y2,
            item.name,
            item.plastId,
            item.typeHistory,
            item.isImaginary,
            item.isIntermediate,
            item.isDrilledFoundation,
            item.trajectories,
            item.plastNames
        );
    }

    public static copyRenameFrom(item: WellPoint): WellPoint {
        return new WellPoint(
            item.id,
            item.x,
            item.y,
            item.x2,
            item.y2,
            item.id.toString(),
            item.plastId,
            item.typeHistory,
            item.isImaginary,
            item.isIntermediate,
            item.isDrilledFoundation,
            item.trajectories,
            item.plastNames
        );
    }

    public static copyHorizontalBarrel(item: WellPoint, x: number, y: number): WellPoint {
        return new WellPoint(
            item.id,
            item.x,
            item.y,
            x,
            y,
            item.name,
            item.plastId,
            item.typeHistory,
            item.isImaginary,
            item.isIntermediate,
            item.isDrilledFoundation,
            item.trajectories,
            item.plastNames
        );
    }
}

export class ImaginaryCharWorkHistory {
    public id: number;
    public startDate: Date;
    public closingDate: Date;
    public type: WellTypeEnum;
    public isImaginary: boolean;
    public alreadyClosed: boolean;

    public get isEmpty(): boolean {
        if (isNil(this.startDate) && isNil(this.closingDate)) {
            return true;
        }

        return false;
    }

    public constructor(startDate: Date = null, closingDate: Date = null, type: WellTypeEnum = WellTypeEnum.Unknown) {
        this.startDate = isNil(startDate) ? null : new Date(startDate);
        this.closingDate = isNil(closingDate) ? null : new Date(closingDate);
        this.type = type;
        this.isImaginary = true;

        this.alreadyClosed = !!this.closingDate;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(x: any): ImaginaryCharWorkHistory {
        let entity = new ImaginaryCharWorkHistory(x.startDate, x.closingDate, x.type);

        entity.isImaginary = !!x.isImaginary;
        entity.alreadyClosed = !!entity.closingDate && !entity.isImaginary;

        return entity;
    }
}

export class ConnectionPoint {
    public id: number;
    public x: number;
    public y: number;
    public d: number;

    public constructor(id: number, x: number, y: number, d: number = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.d = d;
    }
}
