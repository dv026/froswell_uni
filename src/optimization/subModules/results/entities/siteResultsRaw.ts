import { PlastModel } from 'common/entities/plastModel';

import { DateResultsRaw } from './dateResults';

export interface SiteResultsRaw {
    data: DateResultsRaw[];
    bestMainO: number;
    plasts: PlastModel[];
}
