import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    handleResponsePromise,
    ServerResponse,
    str
} from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../gateways/gateway';

/**
 * Возвращает результат расчета относительных фазовых проницаемостей
 * @param plastId               Пласт
 * @param productionObjectId    Объект разработки
 * @param optimizeBL            Необходимо ли минимизировать функцию Баклея-Леверетта
 * @param tests                 Список тестов, которые должны использоваться для расчетов
 */
export const calculatePermeabilities = (
    plastId: number,
    productionObjectId: number,
    optimizeBL: boolean,
    tests: number[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerResponse<any>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('permeabilities'), {
            plastId,
            productionObjectId,
            optimizeBL,
            tests
        })
    );
};

/**
 * Сохраняет расчет относительных фазовых проницаемостей
 * @param plastId               Пласт
 * @param productionObjectId    Объект разработки
 * @param optimizeBL            Необходимо ли минимизировать функцию Баклея-Леверетта
 * @param tests                 Список тестов, которые должны использоваться для расчетов
 * @param stepSize              Шаг изменения водонасыщенности
 */
export const savePermeabilities = (
    plastId: number,
    productionObjectId: number,
    optimizeBL: boolean,
    tests: number[],
    stepSize: number
): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(
        axiosPostWithAuth(proxyUrl('permeabilities-save'), {
            plastId,
            productionObjectId,
            optimizeBL,
            tests,
            stepSize
        })
    );
};

export const optimalCalculatePeriod = (scenarioId: number): Promise<ServerResponse<number>> => {
    const plasts: [string, string][] = [['scenarioId', str(scenarioId)]];
    return handleResponsePromise(axiosGetWithAuth(proxyUrl('calculation-period', [], plasts)));
};
