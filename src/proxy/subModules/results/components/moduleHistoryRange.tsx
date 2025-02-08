import React, { FC } from 'react';

import { find, map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { HistoryRangeProps, HistoryRange } from '../../../../input/components/map/controls/historyRange';
import { wellDetailsState } from '../../../../prediction/subModules/results/store/wellDetails';
import { currentSpot } from '../../../store/well';
import { historyDateState } from '../store/historyDate';
import { mapSettingsState } from '../store/mapSettings';
import { useModuleMapMutations } from '../store/moduleMapMutations';

export const ModuleHistoryRange = () => {
    const historyDate = useRecoilValue(historyDateState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const plastId = useRecoilValue(currentPlastId);
    const well = useRecoilValue(currentSpot);
    const wellDetails = useRecoilValue(wellDetailsState); // todo mb

    const dispatcher = useModuleMapMutations();

    const data = find(x => x.plastId === plastId, wellDetails?.data ?? []);
    const rangeData = map(x => ({ value: x.calc.oilRate, date: x.date }), data?.properties ?? []);

    const historyRangeSettings: HistoryRangeProps = {
        minRange: new Date(mapSettings.mapHistoryRange.minRange),
        maxRange: new Date(mapSettings.mapHistoryRange.maxRange),
        defaultDate: new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.maxRange),
        data: rangeData,
        wellType: well.charWorkId,
        onChange: dispatcher.reload
    };

    return <HistoryRange {...historyRangeSettings} />;
};
