import * as R from 'ramda';

import { isFn } from '../helpers/ramda';

export const shallowEqual = (objA: unknown, objB: unknown): boolean => {
    if (objA === objB) {
        return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Test for A's keys different from B.
    const bHasOwnProperty = objA.hasOwnProperty.bind(objB);
    for (let i = 0; i < keysA.length; i++) {
        if (isFn(objA[keysA[i]]) && isFn(objB[keysA[i]])) {
            continue;
        }

        if (!bHasOwnProperty(keysA[i]) || !R.equals(objA[keysA[i]], objB[keysA[i]])) {
            return false;
        }
    }

    return true;
};

export function shallowCompare<T, S>(
    instance: React.Component<T, S> | React.PureComponent<T, S>,
    nextProps: T,
    nextState: S
): boolean {
    return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
}

export function shallowEqualWithoutFunctions(prevObj: unknown, nextObj: unknown): boolean {
    if (prevObj === nextObj) {
        return true;
    }

    const prevKeys = Object.keys(prevObj);
    const nextKeys = Object.keys(nextObj);
    const len = prevKeys.length;

    if (len !== nextKeys.length) {
        return false;
    }

    let i = -1;

    while (++i < len) {
        const key = prevKeys[i];

        if (!prevObj.hasOwnProperty.call(nextObj, key)) {
            return;
        }

        const prev = prevObj[key];
        const next = nextObj[key];

        if (isFn(prev) && isFn(next)) {
            continue;
        }

        if (prev !== next) {
            return false;
        }
    }

    return true;
}

export function shallowEqualDeep(prevObj: unknown, nextObj: unknown): boolean {
    return JSON.stringify(prevObj) === JSON.stringify(nextObj);
}
