import React from 'react';

import { map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { BreadcrumbControl } from '../../../common/components/breadcrumbControl';
import { currentWellNames } from '../../store/well';

export const Breadcrumb: React.FC = () => {
    const names = useRecoilValue(currentWellNames);

    return <BreadcrumbControl items={map(it => ({ name: it.name }), names ?? [])} />;
};
