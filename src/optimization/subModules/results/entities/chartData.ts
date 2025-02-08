import { any, equals } from 'ramda';

type ChartDataPrediction = {
    date: number;
    nonOptimized: number;
    repairName: string;
    repairNameInjection: string;
};

export const PREDICTION_KEYS: Array<keyof ChartDataPrediction> = [
    'date',
    'nonOptimized',
    'repairName',
    'repairNameInjection'
];

type ChartDataOptimization = {
    [key: string]: number;
};

export type ChartData = ChartDataPrediction & ChartDataOptimization;

export const isRequiredKey = (key: keyof ChartData): boolean => any(equals(key), PREDICTION_KEYS);

export const getKeyForO = (x: number): string => `optimization_${x}`;
