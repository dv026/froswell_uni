import React from 'react';

import { MapSettingModel } from 'commonEfficiency/entities/mapSettingModel';
import { HistoryRangeProps, HistoryRange } from 'input/components/map/controls/historyRange';
import { currentSpot } from 'input/store/well';
import { chartFilteredData } from 'inputEfficiency/store/chartData';
import { map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { historyDateState } from '../store/historyDate';

interface ModuleHistoryRangeProps {
    mapSettings: MapSettingModel;
    onChange: (historyDate: Date) => void;
}

export const ModuleHistoryRange = (props: ModuleHistoryRangeProps) => {
    const { mapSettings, onChange } = props;

    const chartData = useRecoilValue(chartFilteredData);
    const historyDate = useRecoilValue(historyDateState);
    const well = useRecoilValue(currentSpot);

    const rangeData = map(x => ({ value: x.factOil, date: x.dt }), chartData ?? []);

    const historyRangeSettings: HistoryRangeProps = {
        minRange: new Date(mapSettings.mapHistoryRange.minRange),
        maxRange: new Date(mapSettings.mapHistoryRange.maxRange),
        defaultDate: new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange),
        data: rangeData,
        wellType: well.charWorkId,
        onChange: onChange
    };

    return <HistoryRange {...historyRangeSettings} />;
};
