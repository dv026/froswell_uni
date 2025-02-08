import React, { FC } from 'react';

import { BreadcrumbControl } from 'common/components/breadcrumbControl';
import { currentWellNames } from 'proxy/store/well';
import { map } from 'ramda';
import { useRecoilValue } from 'recoil';

export const Breadcrumb = () => {
    const names = useRecoilValue(currentWellNames);

    return <BreadcrumbControl items={map(it => ({ name: it.name }), names ?? [])} />;
};
