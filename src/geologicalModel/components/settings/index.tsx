import React, { FC, memo } from 'react';

import { KeyValue } from 'common/entities/keyValue';
import { PlastModel } from 'common/entities/plastModel';
import { concat, filter, flatten, includes, map } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { SelectPlast } from '../../../common/components/selectPlast';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { mapSettingsState } from '../../store/mapSettings';
import { currentPlastId } from '../../store/plast';
import { plastListState } from '../../store/plasts';
import { CalculationGridModal } from './modal/calculationGridModal';

export const Settings: FC = memo(() => {
    const plasts = useRecoilValue(plastListState);
    const mapSettings = useRecoilValue(mapSettingsState);

    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const requiredFields = [
        GridMapEnum.Power,
        GridMapEnum.Porosity,
        GridMapEnum.Permeability,
        GridMapEnum.OilSaturation
    ];

    const availableGrids =
        (mapSettings.availableGrids && filter(item => includes(item, mapSettings.availableGrids), requiredFields)) ??
        [];

    const problems = availableGrids.length !== requiredFields.length ? [plastId] : [];

    return (
        <>
            <SelectPlast
                selected={plastId}
                dictionary={[PlastModel.byObject()].concat(plasts)}
                problems={problems}
                onChange={setPlastId}
            />
            <CalculationGridModal />
        </>
    );
});
