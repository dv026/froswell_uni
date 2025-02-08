import React, { FC } from 'react';

import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { filter, map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { HistoryRangeProps, HistoryRange } from '../../../../input/components/map/controls/historyRange';
import { currentSpot } from '../../../store/well';
import { DateResults } from '../entities/dateResults';
import { historyDateState } from '../store/historyDate';
import { mapSettingsState } from '../store/mapSettings';
import { modeMapTypeState } from '../store/modeMapType';
import { useModuleMapMutations } from '../store/moduleMapMutations';
import { siteDetailsState } from '../store/siteDetails';

export const ModuleHistoryRange = () => {
    const historyDate = useRecoilValue(historyDateState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const well = useRecoilValue(currentSpot);
    const siteDetails = useRecoilValue(siteDetailsState);
    const mode = useRecoilValue(modeMapTypeState);

    const dispatcher = useModuleMapMutations();

    const accumulated = mode === ModeMapEnum.Accumulated;

    const rangeData = map(
        (x: DateResults) => ({
            value:
                well.charWorkId === WellTypeEnum.Injection
                    ? accumulated
                        ? x.sumInjectionINSIM
                        : x.injectionINSIM
                    : accumulated
                    ? x.sumOilRateINSIM
                    : x.oilRateINSIM,
            date: x.date
        }),
        filter((it: DateResults) => it.mainO === siteDetails?.bestMainO, siteDetails?.dynamic ?? [])
    );

    const historyRangeSettings: HistoryRangeProps = {
        minRange: new Date(mapSettings.mapHistoryRange.minRange),
        maxRange: new Date(mapSettings.mapHistoryRange.maxRange),
        defaultDate: new Date(historyDate ? historyDate : mapSettings.mapHistoryRange.minRange),
        data: rangeData,
        wellType: well.charWorkId,
        onChange: dispatcher.reload
    };

    return <HistoryRange {...historyRangeSettings} />;
};
