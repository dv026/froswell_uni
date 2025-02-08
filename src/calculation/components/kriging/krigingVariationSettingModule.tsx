import React, { FC } from 'react';

import { useSetRecoilState } from 'recoil';

import { KrigingVariationSettings } from '../../../common/components/kriging/krigingVariationSettings';
import { currentGridMap } from '../../store/gridMap';
import { krigingVariationState } from '../../store/krigingVariation';

interface IProps {
    period: Date[];
}

export const KrigingVariationSettingModule: FC<IProps> = (p: IProps) => {
    const setGridMap = useSetRecoilState(currentGridMap);
    const setKrigingSetting = useSetRecoilState(krigingVariationState);

    const submit = async settings => {
        setGridMap(settings.parameter);
        setKrigingSetting(settings);
    };

    return <KrigingVariationSettings period={p.period} submit={submit} />;
};
