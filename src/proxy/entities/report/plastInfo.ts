import { parse } from '../../../common/helpers/date';

export interface PlastInfo {
    id: number;
    name: string;

    adaptationStart: Date;
    adaptationEnd: Date;
    predictionStart: Date;
    predictionEnd: Date;
}

export interface PlastInfoRaw {
    id: number;
    name: string;

    adaptationStart: string;
    adaptationEnd: string;
    predictionStart: string;
    predictionEnd: string;
}

// TODO: формально, parse возвращает Nullable<Date> - необходимо проверить использование
export const fromRaw = (raw: PlastInfoRaw): PlastInfo => ({
    id: raw.id,
    name: raw.name,
    adaptationStart: parse(raw.adaptationStart),
    adaptationEnd: parse(raw.adaptationEnd),
    predictionStart: parse(raw.predictionStart),
    predictionEnd: parse(raw.predictionEnd)
});
