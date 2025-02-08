import React, { FC } from 'react';

import { Button } from '@chakra-ui/react';
import * as R from 'ramda';

import { ids, Pair } from '../../../../common/entities/keyValue';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { KrigingCalcSettingsModel } from '../../../../input/entities/krigingCalcSettings';

interface Props {
    current: GridMapEnum;
    model: KrigingCalcSettingsModel;
    next: () => void;
    toShow: Pair<GridMapEnum, string>[];
}

export const Switcher: FC<Props> = (p: Props) => {
    if (isEmpty(p.model, ids(p.toShow))) {
        return null;
    }

    if (onlyParamToShow(p.model.params, ids(p.toShow))) {
        return <div className='kriging__period-param'>{getParamName(p)}</div>;
    }

    return (
        <div className='kriging__period-param'>
            <div>{getParamName(p)}</div>
            <Button variant='link' className='kriging__next-param' onClick={p.next}>
                След
            </Button>
        </div>
    );
};

const noParamsToShow = (params: string[], toShow: GridMapEnum[]) =>
    R.pipe(x => R.intersection(x, toShow), R.isEmpty)(params);

const onlyParamToShow = (params: string[], toShow: GridMapEnum[]) =>
    R.pipe(
        x => R.intersection(x, toShow),
        x => R.equals(R.length(x), 1)
    )(params);

const isEmpty = (model: KrigingCalcSettingsModel, toShow: GridMapEnum[]) =>
    R.anyPass([R.isNil, x => noParamsToShow(x.params, toShow)])(model);

const getParamName = (p: Props) => (R.find(x => p.current === x.id, p.toShow) || { name: '' }).name;
