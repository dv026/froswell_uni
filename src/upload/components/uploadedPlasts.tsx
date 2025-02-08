import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Column, Table, TableRowProps } from 'react-virtualized';
import { useRecoilValue } from 'recoil';

import { EmptyData } from '../../common/components/emptyData';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { cls } from '../../common/helpers/styles';
import { headerRowRenderer, markRenderer, oilWellRenderer } from '../helpers/tableHelper';
import { uploadedPlasts } from '../store/uploadedPlasts';

import css from '../UploadPage.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

const rowRenderer = (props: TableRowProps) => {
    const selected =
        props.rowData.physicalProperties && props.rowData.contours && props.rowData.geologicalProperties ? false : true;

    return (
        <div className={cls(props.className, selected && css.selected)} style={props.style}>
            {props.columns}
        </div>
    );
};

export const UploadedPlasts = () => {
    const { t } = useTranslation();

    const plasts = useRecoilValue(uploadedPlasts);

    if (isNullOrEmpty(plasts)) {
        return <EmptyData />;
    }

    return (
        <Box p='10px 20px'>
            <Table
                className={css.uploadTable}
                width={1020}
                height={700}
                headerHeight={40}
                rowHeight={40}
                headerClassName={css.headerCell}
                rowClassName={css.rowCell}
                rowRenderer={rowRenderer}
                headerRowRenderer={headerRowRenderer}
                rowCount={plasts.length}
                rowGetter={({ index }) => plasts[index]}
            >
                <Column label={t(dict.common.plast)} dataKey='plastName' width={170} cellRenderer={oilWellRenderer} />
                <Column
                    label={t(dict.common.object)}
                    dataKey='productionObjectName'
                    width={170}
                    cellRenderer={oilWellRenderer}
                />
                <Column
                    label={t(dict.load.physicalProperties)}
                    dataKey='physicalProperties'
                    width={170}
                    cellRenderer={markRenderer}
                />
                <Column label={t(dict.common.contours)} dataKey='contours' width={170} cellRenderer={markRenderer} />
                <Column
                    label={t(dict.load.geologicalProperties)}
                    dataKey='geologicalProperties'
                    width={170}
                    cellRenderer={markRenderer}
                />
                <Column
                    label={t(dict.load.permeability)}
                    dataKey='permeabilities'
                    width={170}
                    cellRenderer={markRenderer}
                />
                <Column label={t(dict.load.grids)} dataKey='grids' width={170} cellRenderer={markRenderer} />
            </Table>
        </Box>
    );
};
