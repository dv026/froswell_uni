// TODO: типизация

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStandaloneToast } from '@chakra-ui/toast';
import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import i18n from 'i18next';
import * as R from 'ramda';
import { isNil } from 'ramda';

import { clearAuth, getToken, isLogged } from '../../identity/helpers/authHelper';
import { RouteEnum } from '../enums/routeEnum';
import { appSettings } from '../settings';
import authFetch from './axios';
import { nul } from './ramda';
import { uid } from './strings';

import mainDict from './i18n/dictionary/main.json';

const { toast } = createStandaloneToast();

enum ServiceEnum {
    Default = 1,
    Robot = 2
}

const querySeparator = (x: string) => (R.equals(R.last(x), '?') ? '' : '&');
const basePath = (service: ServiceEnum) =>
    service === ServiceEnum.Robot ? appSettings.serverRobotPath : appSettings.serverPath;

const controller = (service: ServiceEnum, name: string) => `${basePath(service)}/${name}`;

const action = (service: ServiceEnum, controllerName: string, actionName: string) =>
    `${controller(service, controllerName)}/${actionName}`;

const options = (service: ServiceEnum, controllerName: string, actionName: string, opts: Array<string> = []) =>
    R.reduce((x: string, y: string) => `${x}/${y}`, action(service, controllerName, actionName), opts || []);

const baseUrl = (
    service: ServiceEnum,
    controllerName: string,
    actionName: string = '',
    opts: Array<string> = [],
    query: Array<[string, string]> = []
) =>
    R.reduce(
        (x: string, y: [string, string]) => `${x}${querySeparator(x)}${y[0]}=${y[1]}`,
        `${options(service, controllerName, actionName, opts)}${R.isEmpty(query) ? '' : '?'}`,
        query
    );

/**
 * Возвращает строку url вида 'путь-к-серверу/controllerName/actionName/opts?query'
 * Например:
 *      url('proxy', 'well', [ 'injection', 10001' ], [['brief', 'true'], ['mode', '1']]) =
 *              'путь-к-серверу/proxy/well/injection/10001?brief=true&mode=1'
 * @param controllerName название контроллера
 * @param actionName название экшна
 * @param opts массив параметров экшна
 * @param query массив кортежей (ключ, значение), представляющих собой параметры url
 */
export const url = (
    controllerName: string,
    actionName: string,
    opts: string[] = [],
    query: [string, string][] = []
): string => baseUrl(ServiceEnum.Default, controllerName, actionName, opts, query);

export const urlRobot = (
    controllerName: string,
    actionName: string = '',
    opts: Array<string> = [],
    query: Array<[string, string]> = []
): string => baseUrl(ServiceEnum.Robot, controllerName, actionName, opts, query);

const authConfig = () => {
    return isLogged()
        ? {
              headers: {
                  Authorization: 'Bearer ' + getToken()
              }
          }
        : null;
};

const authBlobConfig = () => {
    return isLogged()
        ? ({
              headers: {
                  Authorization: 'Bearer ' + getToken()
              },
              responseType: 'blob'
          } as AxiosRequestConfig)
        : null;
};

export const axiosGet = (url: string) => {
    return authFetch.get(url);
};

export const axiosGetWithAuth = (url: string) => {
    return authFetch.get(url, authConfig());
};

export const axiosGetBlobWithAuth = (url: string): AxiosPromise<any> => {
    return authFetch.get(url, authBlobConfig());
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const axiosPost = (url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return authFetch.post(url, data, config);
};

export const axiosPostWithAuth = (url: string, data?: any) => {
    return authFetch.post(url, data, authConfig());
};

export const axiosPostBlobWithAuth = (url: string, data?: any) => {
    return authFetch.post(url, data, authBlobConfig());
};

export const axiosRefreshWithAuth = (url: string, data?: any) => {
    return axios.post(url, data, authConfig());
};

export const axiosDeleteWithAuth = (url: string) => {
    return authFetch.delete(url, authConfig());
};

export const axiosUploadFiles = (url: string, data?: any) => {
    return authFetch.post(url, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: 'Bearer ' + getToken() }
    });
};

const nullOrStr = (condition: (x) => boolean): ((x) => string) =>
    R.ifElse(
        condition,
        () => 'null',
        x => x.toString()
    );

/**
 * Возвращает строковое представление значения.
 * Причем, если значение либо null, либо undefined, то возвращается строка 'null'
 *      Например:
 *          str(1) = '1'
 *          str('abc') = 'abc'
 *          str(undefined) = 'null'
 * @param x значение для преобразования в строку
 */
export const str = (x: unknown): string => nullOrStr(R.isNil)(x);

/**
 * Возвращает строковое представление значения.
 * Причем, если значение либо null, либо undefined, либо 0, то возвращается строка 'null'
 *      Например:
 *          str(1) = '1'
 *          str('abc') = 'abc'
 *          str(undefined) = 'null'
 * @param x значение для преобразования в строку
 */
const nilOrZero = R.either(R.isNil, R.equals(0));
export const enm = (x: unknown): string => nullOrStr(nilOrZero)(x);

/**
 * Преобразует список значений в параметры url
 */
// const listToParams = (paramName: string, list: []): [string, string][] =>
//     R.map(x => [paramName, x] as [string, string])(list);

// export const listQuery = (paramName: string, list: []): [string, string][] =>
//     R.ifElse(
//         x => R.either(R.isNil, R.isEmpty)(x),
//         R.always(''),
//         x => listToParams(paramName, x)
//     )(list);

/**
 * Удаляет все слэши или обратные слэши из начала и конца строки
 * @param url   Строка url
 */
export const trimPathName = (url: string): string => url.replace(/^(\\|\/)+|(\\|\/)+$/g, '');

/**
 * Обработанный результат запроса к серверу
 */
export interface ServerResponse<T> {
    /**
     * Результат, отправленный сервером
     *      Всегда **null** в том случае, если сервер вернул ошибку
     */
    data: T;

    /**
     * Статус ошибки
     *      Всегда **null** в том случае, если сервер вернул корректный результат
     */
    error: any;
}

/**
 * Обрабатывает ответ сервера, возвращая результат без необходимости обработки ошибок в try-catch блоке
 */
export function handleResponsePromise<T>(
    promise: any,
    customErrorHandler: (error: any) => void = null
): Promise<ServerResponse<T>> {
    return promise
        .then(response => ({ data: response.data as T, error: null }))
        .catch(isNil(customErrorHandler) ? commonErrorHandler : customErrorHandler);
}

const commonErrorHandler = async error => {
    const status = +R.pathOr(500, ['response', 'status'], error);

    if (status !== 401) {
        toast({
            id: uid(),
            title: errorMessage(status), // TODO: временное решение - разобраться, почему кастомное Brand-исключение от сервера не обрабатывается
            description: error.toString(),
            duration: 6000,
            status: 'error',
            isClosable: true
        });
    }

    return { error: error?.response?.status, data: null };
};

const errorMessage = (status: number) =>
    R.cond([
        [R.equals(404), R.always(i18n.t(mainDict.common.message.serverNotResponding))],
        [R.equals(500), R.always(i18n.t(mainDict.common.message.internalServerError))],
        [R.T, R.always(null)]
    ])(status);
