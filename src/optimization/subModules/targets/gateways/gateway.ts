import { map } from 'ramda';

import { WellBrief } from '../../../../common/entities/wellBrief';
import { dateWithoutZone } from '../../../../common/helpers/date';
import { shallow } from '../../../../common/helpers/ramda';
import { axiosPostWithAuth, handleResponsePromise, ServerResponse } from '../../../../common/helpers/serverPath';
import { proxyUrl } from '../../../../proxy/gateways/gateway';
import { ChartModel } from '../entities/chartModel';
import { TargetOptionModel } from '../entities/targetOptionModel';

interface DataResponse {
    targetZones: TargetOptionModel[];
    chartData: ChartModel[];
}

export const requestTargetZones = async (
    well: WellBrief,
    plastId: number,
    selectedWells: number[]
): Promise<ServerResponse<DataResponse>> => {
    return handleResponsePromise<DataResponse>(
        axiosPostWithAuth(proxyUrl('get-target-zones'), {
            oilFieldId: well.oilFieldId,
            productionObjectId: well.prodObjId,
            scenarioId: well.scenarioId,
            subScenarioId: well.subScenarioId,
            plastId: plastId || null,
            selectedWells: map(it => new WellBrief(well.oilFieldId, it, well.prodObjId), selectedWells)
        })
    );
};

export const createTargetZone = (model: TargetOptionModel): Promise<ServerResponse<number>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('add-target-zone'), model));
};

export const updateTargetZone = (model: TargetOptionModel): Promise<ServerResponse<number>> => {
    return handleResponsePromise(
        axiosPostWithAuth(
            proxyUrl('update-target-zone'),
            shallow(model, {
                minDate: dateWithoutZone(model.minDate),
                maxDate: dateWithoutZone(model.maxDate)
            })
        )
    );
};

export const removeTargetZone = (model: TargetOptionModel): Promise<ServerResponse<boolean>> => {
    return handleResponsePromise(axiosPostWithAuth(proxyUrl('remove-target-zone'), model));
};
