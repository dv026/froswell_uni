import { createSearchParams } from 'react-router-dom';

export const CALC_KEY_NAME = 'key';

export const makeCalculationQuery = (calcKey: string) => createSearchParams({ [CALC_KEY_NAME]: calcKey }).toString();

export const getCalculationKeyFromQuery = (query: URLSearchParams): string | null =>
    query.has(CALC_KEY_NAME) ? query.get(CALC_KEY_NAME) : null;
