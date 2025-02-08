import { isNil } from 'ramda';

import { WellTypeEnum } from '../../enums/wellTypeEnum';

export class CharworkPeriod {
    public id: number;
    public startDate: Date;
    public closingDate: Date;
    public type: WellTypeEnum;
    public isImaginary: boolean;
    public alreadyClosed: boolean;

    public constructor(startDate: Date = null, closingDate: Date = null, type: WellTypeEnum = WellTypeEnum.Unknown) {
        this.startDate = isNil(startDate) ? null : new Date(startDate);
        this.closingDate = isNil(closingDate) ? null : new Date(closingDate);
        this.type = type;
        this.isImaginary = true;

        this.alreadyClosed = !!this.closingDate;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(x: any): CharworkPeriod {
        let entity = new CharworkPeriod(x.startDate, x.closingDate, x.type);

        entity.isImaginary = !!x.isImaginary;
        entity.alreadyClosed = !!entity.closingDate && !entity.isImaginary;

        return entity;
    }
}
