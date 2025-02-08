import React, { FC, useState } from 'react';

import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';

import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';
import { UserModel } from '../entities/userModel';
import { addUser, changePasswordPost, removeUser, toggleAdminRole } from '../gateways';
import { userListState } from '../store/userModel';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const AdminPanel = () => {
    const { t } = useTranslation();

    const users = useRecoilValue(userListState);

    const refreshUserList = useRecoilRefresher_UNSTABLE(userListState);

    const [newUser, setNewUser] = useState<UserModel>(new UserModel(0, '', '', '', false));
    const [changedPassword, setChangedPassword] = useState<string[]>([]);

    if (isNullOrEmpty(users)) {
        return <p>Access denied</p>;
    }

    const adminRenderer = renderer => {
        const onChangeRole = async () => {
            await toggleAdminRole(renderer.rowData.id);
            refreshUserList();
        };

        return <Checkbox isChecked={renderer.cellData} onChange={onChangeRole} />;
    };

    const changePasswordRenderer = renderer => {
        const value = changedPassword[renderer.cellData];

        const onChangePassword = (e, id) => {
            let newValue = changedPassword;
            newValue[id] = e.target.value;

            setChangedPassword(newValue);
        };

        const onClickToChangePassword = async () => {
            const id = renderer.cellData;
            const newPassword = changedPassword[id];

            await changePasswordPost(new UserModel(id, null, null, newPassword, null));

            // TODO: необходимость кода?
            // eslint-disable-next-line react/no-direct-mutation-state
            changedPassword[id] = '';

            setChangedPassword(changedPassword);
        };

        return (
            <>
                <Input
                    autoComplete='off'
                    type='password'
                    placeholder={t(dict.account.newPassword)}
                    value={value}
                    onChange={e => onChangePassword(e, renderer.cellData)}
                />
                <Button className='button button_change' onClick={onClickToChangePassword}>
                    {t(dict.account.change)}
                </Button>
            </>
        );
    };

    const removeUserRenderer = renderer => {
        return (
            <Button
                className='button button_delete'
                onClick={async () => {
                    // eslint-disable-next-line no-alert
                    if (window.confirm(t(dict.account.removeUser))) {
                        await removeUser(renderer.cellData);
                        refreshUserList();
                    }
                }}
            >
                {t(dict.common.remove)}
            </Button>
        );
    };

    const renderTable = ({ height, width }) => {
        return (
            <Table
                width={width}
                height={height}
                headerHeight={20}
                rowHeight={30}
                rowCount={users.length}
                rowGetter={({ index }) => users[index]}
            >
                <Column label={t(dict.account.userName)} dataKey='userName' width={250} />
                <Column label='Email' dataKey='email' width={300} />
                <Column
                    label={t(dict.account.admin)}
                    dataKey='isAdmin'
                    width={200}
                    cellRenderer={e => adminRenderer(e)}
                />
                <Column
                    label={t(dict.account.changePassword)}
                    dataKey='id'
                    width={450}
                    cellRenderer={e => changePasswordRenderer(e)}
                />
                <Column
                    label={t(dict.account.actions)}
                    dataKey='id'
                    width={250}
                    cellRenderer={e => removeUserRenderer(e)}
                />
            </Table>
        );
    };

    return (
        <Flex>
            <Box w='1000px' h='450px'>
                <Heading>{t(dict.account.listUsers)}</Heading>
                <AutoSizer>{renderTable}</AutoSizer>
            </Box>
            <Box>
                <Heading>{t(dict.account.createNewUser)}</Heading>
                <FormControl>
                    <FormLabel>{t(dict.account.userName)}</FormLabel>
                    <Input
                        autoComplete='off'
                        value={newUser.userName}
                        onChange={e => setNewUser(shallow(newUser, { userName: e.target.value }))}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                        autoComplete='off'
                        value={newUser.email}
                        onChange={e => setNewUser(shallow(newUser, { email: e.target.value }))}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>{t(dict.account.password)}</FormLabel>
                    <Input
                        autoComplete='off'
                        type='password'
                        value={newUser.password}
                        onChange={e => setNewUser(shallow(newUser, { password: e.target.value }))}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>{t(dict.account.admin)}</FormLabel>
                    <Checkbox
                        isChecked={newUser.isAdmin}
                        onChange={e => setNewUser(shallow(newUser, { isAdmin: e.target.checked }))}
                    />
                </FormControl>
                <FormControl>
                    <Button
                        className='button button_create'
                        onClick={async () => {
                            await addUser(newUser);
                            refreshUserList();
                        }}
                    >
                        {t(dict.account.createUser)}
                    </Button>
                </FormControl>
            </Box>
        </Flex>
    );
};
