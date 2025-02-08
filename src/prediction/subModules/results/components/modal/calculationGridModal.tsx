import React from 'react';

import { useRecoilValue } from 'recoil';

import { CalculationGridModal as BaseModal } from '../../../../../calculation/components/results/modal/calculationGridModal';
import { CalculationModeEnum } from '../../../../../calculation/enums/calculationModeEnum';
import { mapSettingsState } from '../../store/mapSettings';

export const CalculationGridModal: React.FC = () => {
    const mapSettings = useRecoilValue(mapSettingsState);

    return <BaseModal availableGrids={mapSettings.availableGrids} mode={CalculationModeEnum.Prediction} />;
};
