import { AdaptationSummary } from '../insim/adaptationSummary';

export interface AdaptationsWellsSummary extends AdaptationSummary {
    wellId: number;
    wellName: string;
    x: number;
    y: number;
}
