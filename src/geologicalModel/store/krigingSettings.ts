import { head, map, pipe, sortBy } from 'ramda';
import { atom, selector } from 'recoil';

import { ParamDate } from '../../common/entities/paramDate';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { defaultMaxDate, defaultMinDate, KrigingCalcSettingsModel } from '../../input/entities/krigingCalcSettings';
import { getKrigingDefaultDates } from '../../input/gateways';
import { plastListState } from './plasts';
import { currentSpot } from './well';

const krigingSettingsLoad = selector<KrigingCalcSettingsModel>({
    key: 'geologicalModel__krigingSettingsLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const plasts = get(plastListState);

        let krigingSettings = new KrigingCalcSettingsModel(); // todo mb

        const response = await getKrigingDefaultDates(well.prodObjId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        krigingSettings.values.avgPressureZab = pipe<any, ParamDate[], ParamDate[]>(
            map(ParamDate.fromRaw),
            sortBy(x => x.date)
        )(response.data || []);

        krigingSettings.defaultDates = {
            minDate: defaultMinDate(krigingSettings.values.avgPressureZab),
            maxDate: defaultMaxDate(krigingSettings.values.avgPressureZab)
        };

        krigingSettings.startDate = krigingSettings?.defaultDates?.minDate;
        krigingSettings.endDate = krigingSettings?.defaultDates?.maxDate;

        krigingSettings.plastId = isNullOrEmpty(plasts) ? null : head(plasts)?.id;

        return krigingSettings;
    }
});

export const krigingSettingsState = atom<KrigingCalcSettingsModel>({
    key: 'geologicalModel__krigingSettingsState',
    default: krigingSettingsLoad
});
