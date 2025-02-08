// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
import * as R from 'ramda';

import { WellPoint } from '../entities/proxyMap/wellPoint';

export const getRaw = (data: any): WellPoint[] => {
    const mapper = it => {
        return new WellPoint(
            it.wellId,
            it.x,
            it.y,
            it.x2,
            it.y2,
            it.name,
            it.plastId,
            it.typeHistory,
            it.isImaginaryWell,
            it.isIntermediateWell,
            it.isDrilledFoundation,
            it.trajectories,
            it.plastNames
        );
    };

    return R.map(mapper, data);
};

export const getImaginaryWells = (data: any) => R.map(x => mapper(true, false, x), data);
export const getIntermediateImaginaryWells = (data: any) => R.map(x => mapper(false, true, x), data);

const mapper = (imaginary, intermediate: boolean, it) =>
    new WellPoint(
        it.id,
        it.x,
        it.y,
        it.x2,
        it.y2,
        it.name,
        it.plastId,
        it.typeHistory,
        imaginary,
        intermediate,
        false,
        null,
        it.plastNames
    );
