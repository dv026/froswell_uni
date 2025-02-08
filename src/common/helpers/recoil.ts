import { atom, AtomEffect, Loadable, RecoilState } from 'recoil';

export const hasValue = <T>(value: Loadable<T>): boolean => value.state === 'hasValue';

export const initWithRandom: AtomEffect<number> = ({ setSelf }) => {
    setSelf(Math.random());
};

export const refresher = (module: string, key: string): RecoilState<number> =>
    atom<number>({
        key: `${module}__${key}Refresher`,
        default: 0,
        effects: [initWithRandom]
    });

export const localStorageEffect =
    (key: string) =>
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    ({ setSelf, onSet }): void => {
        const savedValue = localStorage.getItem(key);
        if (savedValue !== null) {
            setSelf(JSON.parse(savedValue));
        }

        onSet((newValue, _, isReset) => {
            isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
        });
    };
