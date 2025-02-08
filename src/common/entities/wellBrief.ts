import { isNil } from 'ramda';

export class WellBrief {
    public oilFieldId: number;
    public id: number;
    public prodObjId: number;
    public charWorkId: number;
    public scenarioId: number;
    public subScenarioId: number;

    public constructor(
        oilFieldId?: number,
        id?: number,
        prodObjId?: number,
        charWorkId?: number,
        scenarioId?: number,
        subScenarioId?: number
    ) {
        this.oilFieldId = oilFieldId || null;
        this.id = id || null;
        this.prodObjId = prodObjId || null;
        this.charWorkId = charWorkId || null;
        this.scenarioId = scenarioId || null;
        this.subScenarioId = subScenarioId || null;
    }

    public toString(): string {
        return `${str(this.oilFieldId)}-${str(this.prodObjId)}-${str(this.id)}-${str(this.scenarioId)}-${str(
            this.subScenarioId
        )}`;
    }

    public toStringWithoutWell(): string {
        return `${str(this.oilFieldId)}-${str(this.prodObjId)}-${str(this.scenarioId)}-${str(this.subScenarioId)}`;
    }

    /**
     * Проверяет, является ли текущий объект "пустым" - то есть таким, у всех свойств которого нет значений
     */
    public isEmpty(): boolean {
        return !this.oilFieldId && !this.prodObjId && !this.charWorkId && !this.scenarioId && !this.subScenarioId;
    }

    public eqTo(well: WellBrief): boolean {
        return well && well.toString() === this.toString();
    }

    // TODO: проверить возможность типизации
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromUrl(url: any): WellBrief {
        return new WellBrief(url.oilFieldId, url.id, url.prodObjId, url.charWorkId, url.scenarioId, url.subScenarioId);
    }

    public static fromString(str: string): WellBrief {
        const keys = str.split('-');

        return new WellBrief(
            fromStr(keys[0]),
            fromStr(keys[2]),
            fromStr(keys[1]),
            null,
            fromStr(keys[3]),
            fromStr(keys[4])
        );
    }
}

/**
 * Возвращает null, если входящее значение не определено, в противном случае возвращает числовое представление
 * входящего значения
 * @param x входящее значение
 */
// const nullOrNumber = x => (!!x ? parseInt(x) : null);

const str = (x: number) => (isNil(x) ? '_' : x.toString());
const fromStr = (s: string) => (s === '_' ? null : Number(s));
