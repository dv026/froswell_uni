import React, { useCallback } from 'react';

import { Button } from '@chakra-ui/react';
import { map } from 'ramda';
import { useTranslation } from 'react-i18next';

import { ExcelReportIcon } from '../../../common/components/customIcon/actions';
import { downloadFile } from '../../../common/helpers/file';
import { exportTabletData } from '../../../input/gateways';
import { WellBrief } from '../../entities/wellBrief';
import { isNullOrEmpty } from '../../helpers/ramda';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    well: WellBrief;
    selectedWells: WellBrief[];
}

export const ExportCommonTablet = (props: IProps) => {
    const { well, selectedWells } = props;

    const { t } = useTranslation();

    const exportDataHandler = useCallback(async () => {
        const response = await exportTabletData(
            well.prodObjId,
            isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells)
        );

        downloadFile(response);
    }, [selectedWells, well.id, well.prodObjId]);

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
            {t(dict.common.report.generate)}
        </Button>
    );
};
