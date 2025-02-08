import { useRecoilCallback } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';
import * as router from '../../common/helpers/routers/router';
import { mapSettingsState } from './map/mapSettings';
import { firstWellFromList, userWell } from './well';
import { wellListState } from './wells';

export function useWellMutations() {
    const set = useRecoilCallback(({ snapshot, set, reset }) => async (well: WellBrief) => {
        const list = await snapshot.getPromise(wellListState);

        let currentWell = null;

        if (!well) {
            currentWell = firstWellFromList(list);
        } else if (router.containsWell(well, list)) {
            currentWell = new WellBrief(well.oilFieldId, well.id, well.prodObjId, well.charWorkId);
        } else if (well.id && !well.prodObjId) {
            // режим когда выбрана скважина и выбраны все объекты
            currentWell = well;
        } else if (router.containsProductionObject(well, list)) {
            currentWell = new WellBrief(well.oilFieldId, null, well.prodObjId);
        } else if (router.containsOilfield(well, list)) {
            currentWell = new WellBrief(well.oilFieldId);
        } else {
            currentWell = firstWellFromList(list);
        }

        reset(mapSettingsState);

        set(userWell, currentWell);
    });

    return {
        set
    };
}
