import React, { FC } from 'react';

import { find, isNil } from 'ramda';
import { useRecoilValue } from 'recoil';

import { BreadcrumbControl } from '../../common/components/breadcrumbControl';
import { currentSpot } from '../store/well';
import { wellListState } from '../store/wells';

export const Breadcrumb = () => {
    const well = useRecoilValue(currentSpot);
    const wells = useRecoilValue(wellListState);

    const obj = find(
        it =>
            it.oilFieldId === well.oilFieldId &&
            (it.productionObjectId === well.prodObjId || isNil(well.prodObjId)) &&
            (it.id === well.id || isNil(well.id)),
        wells ?? []
    );

    if (isNil(obj)) {
        return null;
    }

    const items = [];

    if (!isNil(well.oilFieldId)) {
        items.push({
            name: obj.oilFieldName
        });
    }

    if (!isNil(well.prodObjId)) {
        items.push({
            name: obj.productionObjectName
        });
    }

    return <BreadcrumbControl items={items} />;
};
