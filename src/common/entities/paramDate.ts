import { append, find, head, last, sortBy } from 'ramda';

import { isNullOrEmpty } from '../helpers/ramda';
import { WithDate } from './paramDateOrig';

export class ParamDate {
    public date: Date;
    public value: number;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromRaw(raw: any): ParamDate {
        let entity = new ParamDate();

        entity.date = new Date(raw.dt);
        entity.value = raw.value;

        return entity;
    }
}

export function addMissingDates<T extends WithDate>(dates: T[], create: (dt: Date) => T, min?: Date, max?: Date): T[] {
    if (isNullOrEmpty(dates)) {
        return [];
    }

    const sorted = sortBy(x => x.date, dates);
    min = min || head(sorted).date;
    max = max || last(sorted).date;

    let allDates: T[] = [];
    let currentDate = new Date(min);
    while (currentDate <= max) {
        const currentT =
            find(
                x => x.date.getFullYear() === currentDate.getFullYear() && x.date.getMonth() === currentDate.getMonth(),
                dates
            ) || create(new Date(currentDate));

        allDates = append(currentT, allDates);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return allDates;
}

export const createEmptyParamDate = (dt: Date): ParamDate => {
    let p = new ParamDate();
    p.date = dt;
    p.value = 0;

    return p;
};
