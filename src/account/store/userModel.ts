/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { atom, selector } from 'recoil';

import { refresher } from '../../common/helpers/recoil';
import { UserModel } from '../entities/userModel';
import { getUsers } from '../gateways';

export const refresherUserList = refresher('account', 'userList');

const userList = selector<UserModel[]>({
    key: 'account__listLoader',
    get: async ({ get }) => {
        get(refresherUserList);

        const response = await getUsers();

        return response.data;
    }
});

export const userListState = atom<UserModel[]>({
    key: 'account__userListState',
    default: userList
});
