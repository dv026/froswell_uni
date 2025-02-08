import React, { FC } from 'react';

import { useRecoilValue } from 'recoil';

import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { rangeDataSelector } from '../store/chart/chartModel';
import { historyDateState } from '../store/map/historyDate';
import { mapSettingsState } from '../store/map/mapSettings';
import { useModuleMapMutations } from '../store/map/moduleMapMutations';
import { currentSpot } from '../store/well';
import { HistoryRange, HistoryRangeProps } from './map/controls/historyRange';

export const ModuleHistoryRange = () => {
    const historyDate = useRecoilValue(historyDateState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const rangeData = useRecoilValue(rangeDataSelector);
    const well = useRecoilValue(currentSpot);

    const dispatcher = useModuleMapMutations();

    const historyRangeSettings: HistoryRangeProps = {
        minRange: new Date(mapSettings.mapHistoryRange.minRange),
        maxRange: new Date(mapSettings.mapHistoryRange.maxRange),
        defaultDate: new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange),
        data: rangeData,
        wellType: well.charWorkId === WellTypeEnum.Injection ? WellTypeEnum.Injection : WellTypeEnum.Oil,
        onChange: dispatcher.reload
    };

    return <HistoryRange {...historyRangeSettings} />;
};
