/* eslint-disable @typescript-eslint/no-explicit-any */
import { WellBrief } from '../../common/entities/wellBrief';
import { axiosPostWithAuth, handleResponsePromise, ServerResponse, url } from '../../common/helpers/serverPath';
import { KalmanChartModel } from '../entities/kalmanChartModel';

const filteringUrl = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []) =>
    url('filtering', actionName, opts, query);

export const calcKalman = async (wells: WellBrief[], model: KalmanChartModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(filteringUrl('kalman'), {
            params: model,
            wells: wells
        })
    );
};

export const getSavedResult = async (wells: WellBrief[]): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(filteringUrl('getSavedResult'), wells));
};

export const saveKalman = async (wells: WellBrief[], model: KalmanChartModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(filteringUrl('saveKalman'), {
            params: model,
            wells: wells
        })
    );
};
