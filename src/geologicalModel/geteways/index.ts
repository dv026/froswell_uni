// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlastModel } from '../../common/entities/plastModel';
import { axiosGetWithAuth, handleResponsePromise, ServerResponse, str, url } from '../../common/helpers/serverPath';
import { Nullable } from '../../common/helpers/types';

const CONTROLLER_NAME = 'geological-model';

export const geoUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(CONTROLLER_NAME, actionName, opts, query);

const predictionUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []) =>
    url('prediction', actionName, opts, query);

/**
 * Возвращает с сервера список доступных пластов
 * @param productionObjectId - ид объекта разработки
 * @param wellId - ид скважины (если null, результат возвращается по подсценарию)
 */
export const requestPlasts = async (
    productionObjectId: number,
    wellId: Nullable<number>
): Promise<ServerResponse<PlastModel[]>> => {
    const params: [string, string][] = [
        ['wellId', str(wellId)],
        ['productionObjectId', str(productionObjectId)]
    ];

    return handleResponsePromise<PlastModel[]>(axiosGetWithAuth(predictionUrl('plasts', [], params)));
};
