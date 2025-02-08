import { is } from 'ramda';

export type Nullable<T> = { [P in keyof T]: T[P] | null };

export type Nilable<T> = { [P in keyof T]: T[P] | null | undefined };

export const isNumber = (x: unknown): x is number => is(Number, x);
