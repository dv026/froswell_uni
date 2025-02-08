import React from 'react';

import { map } from 'ramda';
import { useRecoilValueLoadable } from 'recoil';

import { BreadcrumbControl } from '../../../../../common/components/breadcrumbControl';
import { hasValue } from '../../../../../common/helpers/recoil';
import { currentWellNames } from '../../../../store/well';

export const Breadcrumb: React.FC = () => {
    const names = useRecoilValueLoadable(currentWellNames);

    return <BreadcrumbControl items={map(it => ({ name: it.name }), hasValue(names) ? names.contents : [])} />;
};
