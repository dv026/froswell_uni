import React, { FC } from 'react';

import { KrigingVariationLossesSettings } from 'common/components/kriging/krigingVariationLossesSettings';
import { shallow } from 'common/helpers/ramda';
import { krigingVariationLossesState } from 'input/store/map/krigingVariationLosses';
import { useRecoilState } from 'recoil';

interface IProps {
    period: Date[];
}

export const KrigingVariationLossesSettingModule: FC<IProps> = (p: IProps) => {
    const [settings, setSettings] = useRecoilState(krigingVariationLossesState);

    const submit = async settings => {
        setSettings(shallow(settings, { visible: true }));
    };

    const cancel = async () => {
        setSettings(shallow(settings, { visible: false }));
    };

    return <KrigingVariationLossesSettings period={p.period} submit={submit} cancel={cancel} />;
};
