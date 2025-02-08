import React from 'react';

import * as R from 'ramda';
import { Line } from 'recharts';

import { getDot } from '../../../../../common/components/charts/dots';
import { RepairsDot } from '../../../../../common/components/charts/dots/repairsDot';
import { AdaptationINSIM } from '../../../../entities/insim/well';
import { propGetFn } from '../../../../helpers/utils';
import { BestAdaptationEnum } from '../../../calculation/enums/bestAdaptationEnum';

export enum ParameterEnum {
    FBL = 'fbl',
    Injection = 'injection',
    LiqRate = 'liqrate',
    OilRate = 'oilrate',
    Pressure = 'pressure',
    PressureBottomHole = 'pressureBottomHole',
    Transmissibility = 'transmissibility',
    Watercut = 'watercut',
    SkinFactor = 'skinfactor'
}

export const baseLine = (propName: string, param: string, axisId: string = 'left'): React.ReactNode => (
    <Line
        key={propName}
        className={`line_${param}`}
        type='monotone'
        dataKey={propName}
        yAxisId={axisId}
        dot={false}
        isAnimationActive={false}
    />
);

export const baseLineWithRepairs = (
    propName: string,
    param: string,
    axisId: string = 'left',
    isInjection: boolean = false
): React.ReactNode => {
    const dot = {
        static: <RepairsDot isActive={false} dataKey={propName} isInjection={isInjection} />,
        active: <RepairsDot isActive={true} dataKey={propName} isInjection={isInjection} />
    };

    return (
        <Line
            key={propName}
            className={`line_${param}`}
            type='monotone'
            dataKey={propName}
            yAxisId={axisId}
            isAnimationActive={false}
            dot={getDot(dot, propName, true)}
            activeDot={getDot(dot, propName, false)}
        />
    );
};

export const implementationLine = (propName: string): React.ReactNode => (
    <Line
        key={propName}
        className='line_impl'
        type='monotone'
        dataKey={propName}
        yAxisId='left'
        dot={false}
        isAnimationActive={false}
    />
);

export const dottedLine = (propName: string, param: string, axisId: string = 'left'): React.ReactNode => (
    <Line
        key={propName}
        className={`line_${param}`}
        type='monotone'
        dataKey={propName}
        yAxisId={axisId}
        isAnimationActive={false}
        dot={{ r: 5 }}
    />
);

export const getBestAdaptation = (
    adaptations: AdaptationINSIM[],
    bestAdaptationType: BestAdaptationEnum
): AdaptationINSIM => R.find(x => R.any(y => propGetFn(bestAdaptationType)(y), x.dates) === true, adaptations);
