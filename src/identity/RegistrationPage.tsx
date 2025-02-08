import React from 'react';

import { useRecoilValue } from 'recoil';

import RegistrationForm from './components/registrationForm';
import { errorState } from './store/error';
import { useIdentityMutations } from './store/identityMutations';

const RegistrationPage = () => {
    const error = useRecoilValue(errorState);

    const identity = useIdentityMutations();

    return <RegistrationForm register={identity.register} singIn={identity.login} regErrors={error} />;
};

export default RegistrationPage;
