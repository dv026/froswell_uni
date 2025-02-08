import { mergeRight } from 'ramda';

import { AdaptationsWellsSummary } from '../adaptationsWells/adaptationsWellsSummary';
import { AdaptationSummary } from '../insim/adaptationSummary';
import { create as createReport, Report } from './report';

export interface ObjectReport extends Report {
    adaptations: AdaptationSummary[];
    adaptationWells: AdaptationsWellsSummary[];
}

export const clear = (rep: ObjectReport): void => {
    rep.adaptations = null;
    rep.adaptationWells = null;
};

export const create = (schemaId: [number, number]): ObjectReport =>
    mergeRight(createReport(schemaId), {
        adaptationWells: null,
        adaptations: null
    });

export function refresh<K extends keyof ObjectReport>(key: K, value: ObjectReport[K], report: ObjectReport): void {
    if (key === 'schemaId') {
        report.adaptationWells = null;
        report.adaptations = null;
        report.plasts = null;
    }

    report[key] = value;
}
