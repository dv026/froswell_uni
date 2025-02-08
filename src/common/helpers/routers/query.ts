import * as qs from 'qs';

import { WellBrief } from '../../entities/wellBrief';
import { tryParse } from '../number';

export const makeWellFromSearch = (search: string): WellBrief | null => {
    const well = qs.parse(search, { ignoreQueryPrefix: true });

    if (!well || !well.prodObjId || !well.oilFieldId) {
        return null;
    }

    return new WellBrief(
        tryParse(well.oilFieldId),
        tryParse(well.id),
        tryParse(well.prodObjId),
        tryParse(well.wellType),
        tryParse(well.scenarioId),
        tryParse(well.subScenarioId)
    );
};

export const makeQueryFromWell = (well: WellBrief): string => {
    if (!well) {
        return '';
    }

    const params = {
        oilFieldId: well.oilFieldId,
        prodObjId: well.prodObjId,
        id: well.id,
        wellType: well.charWorkId,
        scenarioId: well.scenarioId,
        subScenarioId: well.subScenarioId
    };

    return qs.stringify(params, { skipNulls: true, addQueryPrefix: true });
};
