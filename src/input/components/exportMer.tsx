import React, { useCallback } from 'react';

import { Button } from '@chakra-ui/react';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { displayModeState } from 'input/store/displayMode';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ExcelReportIcon } from '../../common/components/customIcon/actions';
import { downloadFile } from '../../common/helpers/file';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { exportMapData } from '../../input/gateways';
import { selectedWellsState } from '../store/selectedWells';
import { currentSpot } from '../store/well';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const ExportMer = () => {
    const { t } = useTranslation();

    const displayMode = useRecoilValue(displayModeState);
    const well = useRecoilValue(currentSpot);
    const selectedWells = useRecoilValue(selectedWellsState);

    const exportDataHandler = useCallback(async () => {
        const response = await exportMapData(isNullOrEmpty(selectedWells) ? [well] : selectedWells);
        downloadFile(response);
    }, [selectedWells, well]);

    if (displayMode !== DisplayModeEnum.Chart) {
        return null;
    }

    return (
        <Button
            onClick={exportDataHandler}
            position='absolute'
            bottom='0'
            right='0'
            padding='0 20px'
            leftIcon={<ExcelReportIcon boxSize={5} color='icons.grey' />}
            variant='unstyled'
        >
            {t(dict.input.exportMer)}
        </Button>
    );
};
