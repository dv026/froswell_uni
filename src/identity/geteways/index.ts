// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { nul } from 'common/helpers/ramda';

import {
    axiosPost,
    axiosRefreshWithAuth,
    handleResponsePromise,
    ServerResponse,
    url
} from '../../common/helpers/serverPath';
import { RegistrationModel } from '../entities/registrationModel';

export const identityUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url('identity', actionName, opts, query);

export const token = async (username: string, password: string): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPost(
            identityUrl('token'),
            { username: username, password: password },
            { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        )
    );
};

export const refreshToken = async (accessToken: string, refreshToken: string): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosRefreshWithAuth(identityUrl('refresh-token'), { accessToken: accessToken, refreshToken: refreshToken }),
        nul
    );
};

export const registration = async (model: RegistrationModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPost(identityUrl('register'), model, {
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        })
    );
};
