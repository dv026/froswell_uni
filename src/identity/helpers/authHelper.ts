const tokenKey = 'tokenKey';
const locationKey = 'locationKey';

export const authTimerRefreshToken = 300000; // 5min

export const saveAuth = (userName: string, token: string, refreshToken: string): void => {
    localStorage.setItem(
        tokenKey,
        JSON.stringify({ userName: userName, access_token: token, refresh_token: refreshToken })
    );
};

export const clearAuth = (): void => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(locationKey);
};

export const loginName = (): string => {
    let item = localStorage.getItem(tokenKey);
    let login = '';
    if (item) {
        login = JSON.parse(item).userName;
    }

    return login;
};

export const isLogged = (): boolean => {
    let item = localStorage.getItem(tokenKey);
    if (item) {
        return true;
    } else {
        return false;
    }
};

export const getToken = (): string => {
    let item = localStorage.getItem(tokenKey);
    let token = null;
    if (item) {
        token = JSON.parse(item).access_token;
    }

    return token;
};

export const getRefreshToken = (): string => {
    let item = localStorage.getItem(tokenKey);
    let token = null;
    if (item) {
        token = JSON.parse(item)?.refresh_token?.tokenString;
    }

    return token;
};

export const setLocation = (location: unknown): void => {
    localStorage.setItem(locationKey, JSON.stringify({ location: location }));
};

export const getLocation = (): string => {
    let item = localStorage.getItem(locationKey);
    let localtion = '/';
    if (item) {
        localtion = JSON.parse(item).location;
    }

    return localtion;
};
