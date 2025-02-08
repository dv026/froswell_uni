import React, { FC, memo } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';

import { SelectPlast } from '../../common/components/selectPlast';
import { currentPlastSelector } from '../store/currentPlast';
import { oilFieldPropertiesSelector } from '../store/oilFieldProperties';

export const Settings: FC = memo(() => {
    const props = useRecoilValue(oilFieldPropertiesSelector);

    const [plast, setPlast] = useRecoilState(currentPlastSelector);

    return <SelectPlast dictionary={props.plasts} selected={plast} onChange={setPlast} />;
});
