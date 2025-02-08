import React from 'react';

import { useRecoilValue } from 'recoil';

import { ExportCommonTablet } from '../../common/components/export/exportCommonTablet';
import { DisplayModeEnum } from '../../common/enums/displayModeEnum';
import { displayModeState } from '../../input/store/displayMode';
import { selectedWellsState } from '../store/selectedWells';
import { currentSpot } from '../store/well';

export const ExportTablet = () => {
    const displayMode = useRecoilValue(displayModeState);
    const well = useRecoilValue(currentSpot);
    const selectedWells = useRecoilValue(selectedWellsState);

    if (displayMode !== DisplayModeEnum.TabletNew) {
        return null;
    }

    return <ExportCommonTablet well={well} selectedWells={selectedWells} />;
};
