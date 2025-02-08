const storageKey = 'environment';

export const saveEnvironment = (value: string): void => {
    localStorage.setItem(storageKey, JSON.stringify({ environment: value }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEnvironment = (): any => {
    const item = localStorage.getItem(storageKey);
    let environment = null;
    if (item) {
        environment = JSON.parse(item).environment;
    }

    return environment;
};

export const isDemoEnvironment = (): boolean => {
    // TODO: проверить работоспособность
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const env = this ? this.getEnvironment() : null;
    return env && env === 'Demo';
};
