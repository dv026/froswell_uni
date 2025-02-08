import React, { FC } from 'react';

import { useRecoilState } from 'recoil';

import { Card } from '../../../../calculation/components/wellGroup';
import { ButtonsSmall } from '../../../../calculation/components/wellGroup/buttonsSmall';
import { Curtain } from '../../../../common/components/curtain';
import { optimizationWellsState } from '../store/optimizationWells';

export const WellGroupsCurtain = () => {
    const [wells, setWells] = useRecoilState(optimizationWellsState);

    return (
        <Curtain position='top-right'>
            <Card key='small' size='small' buttonGroup={ButtonsSmall} wells={wells} setWells={setWells} />
        </Curtain>
    );
};
