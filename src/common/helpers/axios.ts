import axios from 'axios';
import { RouteEnum } from 'common/enums/routeEnum';

import { refreshToken } from '../../identity/geteways';
import { clearAuth, getRefreshToken, getToken, saveAuth } from '../../identity/helpers/authHelper';

const authFetch = axios.create();

// for multiple requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

authFetch.interceptors.response.use(
    response => response,
    async error => {
        const originalConfig = error.config;
        if (error.response) {
            if (error.response.status === 401 && !originalConfig._retry) {
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(token => {
                            originalConfig.headers.Authorization = 'Bearer ' + token;
                            return authFetch(originalConfig);
                        })
                        .catch(err => {
                            return Promise.reject(err);
                        });
                }

                originalConfig._retry = true;
                isRefreshing = true;

                try {
                    const rs = await refreshToken(getToken(), getRefreshToken());
                    if (rs) {
                        saveAuth(rs.data.username, rs.data.access_token, rs.data.refresh_token);
                        originalConfig.headers.Authorization = `Bearer ${rs.data.access_token}`;

                        processQueue(null, rs.data.access_token);

                        return Promise.resolve(authFetch(originalConfig));
                    }

                    clearAuth();
                    window.location.replace(RouteEnum.Login);

                    return Promise.reject(error);
                } catch (_error) {
                    if (_error.response && _error.response.data) {
                        return Promise.reject(_error.response.data);
                    }

                    processQueue(_error, null);

                    return Promise.reject(_error);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default authFetch;
