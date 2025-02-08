import { mergeRight } from 'ramda';

import { WellPointRaw } from '../../../common/entities/wellPoint';
import { AdaptationsWellsSummary } from '../adaptationsWells/adaptationsWellsSummary';
import { WellINSIM } from '../insim/well';
import { NeighborModel } from '../neighborModel';
import { create as createReport, Report } from './report';

export interface WellReport extends Report {
    adaptationWells: AdaptationsWellsSummary[];
    insim: WellINSIM;
    neighbors: NeighborModel[];
    points: WellPointRaw[];
}

export const create = (schemaId: [number, number]): WellReport =>
    mergeRight(createReport(schemaId), {
        insim: null,
        adaptationWells: null,
        neighbors: null,
        points: null
    });

export function refresh<K extends keyof WellReport>(key: K, value: WellReport[K], report: WellReport): void {
    if (key === 'schemaId') {
        report.insim = null;
        report.neighbors = null;
        report.plasts = null;
        report.points = null;
        report.adaptationWells = null;
    }

    report[key] = value;
}
