/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    url
} from '../../common/helpers/serverPath';
import { UserModel } from '../entities/userModel';

const controllerName: string = 'account';

export const accountUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(controllerName, actionName, opts, query);

export const getUsers = async (): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosGetWithAuth(accountUrl('users', [])));
};

export const addUser = async (model: UserModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(accountUrl('addUser'), model));
};

export const removeUser = async (id: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(accountUrl('removeUser'), { id: id }));
};

export const toggleAdminRole = async (id: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(accountUrl('toggleAdmin'), { id: id }));
};

export const changePasswordPost = async (model: UserModel): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(accountUrl('changePassword'), model));
};
