// TODO: типизация

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AxiosPromise } from 'axios';
import { any, either, equals, isEmpty, isNil, mergeRight, mergeWithKey } from 'ramda';

import { OilReservesProps, Reserves } from './components/mapCanvas/oilReserves';
import { KeyValue } from './entities/keyValue';
import { WellCommentModel } from './entities/mapCanvas/wellCommentModel';
import { PlastModel } from './entities/plastModel';
import { WellBrief } from './entities/wellBrief';
import { WellWithRecordsRaw } from './entities/wellList/wellRaw';
import {
    axiosGetBlobWithAuth,
    axiosGetWithAuth,
    axiosPostWithAuth,
    axiosUploadFiles,
    handleResponsePromise,
    ServerResponse,
    str,
    url
} from './helpers/serverPath';

const commonUrl = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []) =>
    url('common', actionName, opts, query);

export const getWellList = async (): Promise<ServerResponse<WellWithRecordsRaw[]>> =>
    handleResponsePromise(axiosGetWithAuth(commonUrl('wells')));

export const getWellsProxyList = async (): Promise<ServerResponse<WellWithRecordsRaw[]>> =>
    handleResponsePromise(axiosGetWithAuth(commonUrl('wells-proxy')));

export const getWellEfficiencyList = async (): Promise<ServerResponse<WellWithRecordsRaw[]>> =>
    handleResponsePromise(axiosGetWithAuth(commonUrl('wells-efficiency')));

export const getWellPredictionList = async (): Promise<ServerResponse<WellWithRecordsRaw[]>> =>
    handleResponsePromise(axiosGetWithAuth(commonUrl('wells-prediction')));

export const getWellOptimizationList = async (): Promise<ServerResponse<unknown>> =>
    handleResponsePromise(axiosGetWithAuth(commonUrl('wells-optimization')));

export const getPlasts = async (wells: WellBrief[]): Promise<ServerResponse<KeyValue[]>> => {
    return handleResponsePromise(
        axiosPostWithAuth(commonUrl('plasts'), {
            wells: wells
        })
    );
};

export const getCommonWell = async (well: WellBrief): Promise<ServerResponse<WellWithRecordsRaw[]>> => {
    const query: [string, string][] = [
        ['oilFieldId', str(well.oilFieldId)],
        ['wellId', str(well.id)]
    ];

    return handleResponsePromise(axiosGetWithAuth(commonUrl('well', [], query)));
};

export const getWellComments = async (
    wells: WellBrief[],
    plastId: number
): Promise<ServerResponse<WellCommentModel[]>> => {
    return handleResponsePromise(
        axiosPostWithAuth(commonUrl('map-well-comments'), {
            wells: wells,
            plastId: plastId
        })
    );
};

export const getWellCommentFile = async (id: number): Promise<any> => {
    const query: Array<[string, string]> = [['id', str(id)]];

    return axiosGetBlobWithAuth(commonUrl('map-well-comment-file', [], query));
};

export const addWellComments = (model: WellCommentModel): AxiosPromise<any> => {
    if (model.file) {
        const data = model.file;

        data.set('oilFieldId', str(model.oilFieldId));
        data.set('productionObjectId', str(model.productionObjectId));
        data.set('wellId', str(model.wellId));
        data.set('plastId', str(model.plastId));
        data.set('comment', str(model.comment));
        data.set('author', str(model.author));

        return axiosUploadFiles(commonUrl('map-well-comments-add'), data);
    } else {
        return axiosUploadFiles(commonUrl('map-well-comments-add'), {
            oilFieldId: model.oilFieldId,
            productionObjectId: model.productionObjectId,
            wellId: model.wellId,
            plastId: model.plastId,
            comment: model.comment,
            author: model.author
        });
    }
};

export const removeWellComments = async (id: number): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(axiosPostWithAuth(commonUrl('map-well-comments-remove'), { id }));
};

export const getMapOilReserves = async (p: OilReservesProps): Promise<ServerResponse<Reserves>> => {
    // TODO: необходимо унифицировать использование null и PlastModel.byObject().id
    if (p.plastId === PlastModel.byObject().id) {
        p = mergeRight(p, { plastId: null });
    }

    return handleResponsePromise(axiosPostWithAuth(commonUrl('map-oil-reserves'), p));
};

export interface WithValidation<T> {
    errors: number[];
    payload: T;
}

export function shapeRaw<TRaw, TEntity>(raw: TRaw, dateProps: (keyof TRaw)[] = []): TEntity {
    let shaper = (k: string, left, right) => (any(equals(k), dateProps as string[]) ? shapeDate(right) : right);

    return mergeWithKey(shaper, raw, raw);
}

export const shapeDate = (x: string): Date => (either(isNil, isEmpty)(x) ? null : new Date(x));
