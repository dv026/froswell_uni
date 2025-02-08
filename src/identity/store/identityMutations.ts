import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { RouteEnum } from '../../common/enums/routeEnum';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { LoginModel } from '../entities/loginModel';
import { RegistrationModel } from '../entities/registrationModel';
import { refreshToken, registration, token } from '../geteways';
import { clearAuth, getLocation, getRefreshToken, getToken, isLogged, saveAuth } from '../helpers/authHelper';
import { errorState } from './error';
import { userNameState } from './userName';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export function useIdentityMutations() {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const login = useRecoilCallback(({ set }) => async (model: LoginModel) => {
        if (!model.userName || !model.password) {
            set(errorState, t(dict.account.messages.pleaseFillUsernameAndPassword));
            return;
        }

        const response = await token(model.userName, model.password);

        if (!response || response.error || !response.data) {
            set(errorState, t(dict.account.messages.enteredUsernameOrPasswordIncorrect));
            return;
        }

        saveAuth(response.data.username, response.data.access_token, response.data.refresh_token);

        set(userNameState, response.data.username);
        set(errorState, null);

        navigate(getLocation());
    });

    const register = useRecoilCallback(({ set }) => async (model: RegistrationModel) => {
        if (isNullOrEmpty(model.firstName)) {
            set(errorState, t(dict.account.messages.pleaseFillUsername));
        } else if (isNullOrEmpty(model.lastName)) {
            set(errorState, t(dict.account.messages.pleaseFillSurname));
        } else if (isNullOrEmpty(model.email)) {
            set(errorState, t(dict.account.messages.pleaseFillEmail));
        } else if (isNullOrEmpty(model.company)) {
            set(errorState, t(dict.account.messages.pleaseFillCompany));
        } else if (isNullOrEmpty(model.password) || isNullOrEmpty(model.rePassword)) {
            set(errorState, t(dict.account.messages.pleaseFillPassword));
        } else if (model.password !== model.rePassword) {
            set(errorState, t(dict.account.messages.passwordAndConfirmationNotMatch));
        } else {
            const response = await registration(model);

            if (!response || response.error || !response.data) {
                if (
                    !isNullOrEmpty(response.error) &&
                    !isNullOrEmpty(response.error.data) &&
                    !isNullOrEmpty(response.error.data.errors)
                ) {
                    set(errorState, response.error.data.errors['error'][0]);
                } else {
                    set(errorState, t(dict.account.messages.errorWhileRegisteringUser));
                }

                return;
            }

            saveAuth(response.data.username, response.data.access_token, response.data.refresh_token);
            set(userNameState, response.data.username);

            navigate(RouteEnum.Upload);
        }
    });

    const updateToken = useRecoilCallback(() => async () => {
        if (!isLogged()) {
            return;
        }

        const response = await refreshToken(getToken(), getRefreshToken());

        if (response.data) {
            saveAuth(response.data.username, response.data.access_token, response.data.refresh_token);
        }
    });

    const logout = useRecoilCallback(() => async () => {
        if (!isLogged()) {
            return;
        }

        clearAuth();

        navigate(getLocation());
    });

    return {
        login,
        register,
        updateToken,
        logout
    };
}
