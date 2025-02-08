/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxisDomain } from 'recharts/types/util/types';

import { AdaptationINSIM } from '../../../entities/insim/well';

export interface ChartViewData {
    data: any;
    domainRange: AxisDomain;
    domainRangeRight?: AxisDomain;
    legend: {
        content: () => JSX.Element;
        height?: number;
        payload: unknown[];
    };
    lines: JSX.Element[];
    rootClass?: string;
    tooltip: {
        renderFn?: () => JSX.Element;
        payload?: unknown;
    };
    yLeftAxisLabel?: string;
    yRightAxisLabel?: string;
    xAxisLabel?: string;
    tickFormatterLeft?: (value: any, index: number) => string;
    tickFormatterRight?: (value: any, index: number) => string;
}

export interface ChartBuilder {
    name(): string;
    render(
        data: AdaptationINSIM[] | AdaptationINSIM,
        adaptationMode: unknown,
        hiddenLines: string[],
        updateLines: (l: string[] | string) => void
    ): ChartViewData;
}

export const valueProp = (idx: string | number): string => `value_${idx}`;
