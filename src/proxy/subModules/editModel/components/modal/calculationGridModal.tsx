import React from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CalculationGridModal as BaseModal } from '../../../../../calculation/components/results/modal/calculationGridModal';
import { CalculationModeEnum } from '../../../../../calculation/enums/calculationModeEnum';
import { currentPlastId } from '../../../../../calculation/store/currentPlastId';
import { toArray } from '../../../../../common/entities/gridAvailability';
import { GridMapEnum } from '../../../../../common/enums/gridMapEnum';
import { getAvailableGrids } from '../../../../../prediction/subModules/results/gateways/gateway';
import { availableGridsSelector, mapSettingsState } from '../../../../store/map/mapSettings';
import { currentSpot } from '../../../../store/well';

export const CalculationGridModal: React.FC = () => {
    const mapSettings = useRecoilValue(mapSettingsState);
    const well = useRecoilValue(currentSpot);
    const plastId = useRecoilValue(currentPlastId);

    const setAdaptationAvailableGrids = useSetRecoilState(availableGridsSelector);

    const onGoToMap = async () => {
        const response = await getAvailableGrids(well.prodObjId, plastId, well.scenarioId);

        setAdaptationAvailableGrids(toArray<GridMapEnum>(response.data));
    };

    return (
        <BaseModal
            availableGrids={mapSettings.availableGrids}
            mode={CalculationModeEnum.Improvement}
            onGoToMap={onGoToMap}
        />
    );
};
