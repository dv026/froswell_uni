import { is } from 'ramda';

export const isStr = (x: unknown): x is string => is(String, x);
