import React, { FC } from 'react';

import { useRecoilState } from 'recoil';

import { Card } from '../../../../calculation/components/wellGroup';
import { Curtain } from '../../../../common/components/curtain';
import { adaptationWellGroupState } from '../store/adaptationWellGroup';
import { ButtonsSmall } from './buttonsSmall';

export const WellGroupsCurtain = () => {
    const [wells, setWells] = useRecoilState(adaptationWellGroupState);

    return (
        <Curtain position='top-right'>
            <Card key='small' size='small' buttonGroup={ButtonsSmall} wells={wells} setWells={setWells} />
        </Curtain>
    );
};
