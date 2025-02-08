import { map } from 'ramda';

export class KeyValue implements Pair<number, string> {
    public id: number;
    public name: string;

    public constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export interface Pair<K, T> {
    id: K;
    name: T;
}

export function ids<K, T>(pairs: Pair<K, T>[]): K[] {
    return map(x => x.id, pairs);
}

export function names<K, T>(pairs: Pair<K, T>[]): T[] {
    return map(x => x.name, pairs);
}
