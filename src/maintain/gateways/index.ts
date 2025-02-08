import { axiosGetWithAuth, handleResponsePromise, ServerResponse, url } from '../../common/helpers/serverPath';

export const maintainUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url('maintain', actionName, opts, query);

export const getCurrentDb = async (): Promise<ServerResponse<string>> => {
    return handleResponsePromise(axiosGetWithAuth(maintainUrl('db')));
};
