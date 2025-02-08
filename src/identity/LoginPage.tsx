import React from 'react';

import { useRecoilValue } from 'recoil';

import { Login } from './components/login';
import { errorState } from './store/error';
import { useIdentityMutations } from './store/identityMutations';

const LoginPage = () => {
    const error = useRecoilValue(errorState);

    const identity = useIdentityMutations();

    return <Login Submit={identity.login} LogOut={identity.logout} errors={error} />;
};

export default LoginPage;
