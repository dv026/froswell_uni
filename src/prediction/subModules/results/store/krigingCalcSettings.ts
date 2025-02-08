import { map, pipe, sortBy } from 'ramda';
import { atom, selector } from 'recoil';

import { ParamDate } from '../../../../common/entities/paramDate';
import { shallow } from '../../../../common/helpers/ramda';
import {
    defaultMaxDate,
    defaultMinDate,
    KrigingCalcSettingsModel
} from '../../../../input/entities/krigingCalcSettings';
import { currentSpot } from '../../../store/well';
import { getKrigingDefaultDates } from '../gateways/gateway';

const krigingCalcSettingsLoad = selector<KrigingCalcSettingsModel>({
    key: 'predictionResults__krigingCalcSettingsLoad',
    get: async ({ get }) => {
        const well = get(currentSpot);

        const model = new KrigingCalcSettingsModel();

        const { data: response } = await getKrigingDefaultDates(well.prodObjId, well.scenarioId, well.subScenarioId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const oilSaturation = pipe<any, ParamDate[], ParamDate[]>(
            map(ParamDate.fromRaw),
            sortBy(x => x.date)
        )(response.oilSaturation || []);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pressureRes = pipe<any, ParamDate[], ParamDate[]>(
            map(ParamDate.fromRaw),
            sortBy(x => x.date)
        )(response.pressureRes || []);

        const defaultDates = {
            minDate: defaultMinDate(oilSaturation),
            maxDate: defaultMaxDate(oilSaturation)
        };

        const startDate = defaultDates.minDate;
        const endDate = defaultDates.maxDate;

        return shallow(model, {
            values: shallow(model.values, { oilSaturation, pressureRes }),
            defaultDates,
            startDate,
            endDate
        });
    }
});

export const krigingCalcSettingsState = atom<KrigingCalcSettingsModel>({
    key: 'predictionResults__krigingCalcSettingsState',
    default: krigingCalcSettingsLoad
});
