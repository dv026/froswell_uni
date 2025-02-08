import { ParamDate } from './paramDate';

export class ParamDateOrig extends ParamDate {
    public valueOrig: number;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromRaw(raw: any) {
        let entity = new ParamDateOrig();

        entity.date = new Date(raw.dt);
        entity.value = raw.value;
        entity.valueOrig = raw.valueOrig;

        return entity;
    }
}

export type WithDate = ParamDate | ParamDateOrig;

export const createEmptyParamDateOrig = (dt: Date): ParamDateOrig => {
    let p = new ParamDateOrig();
    p.date = dt;
    p.value = 0;
    p.valueOrig = 0;

    return p;
};
