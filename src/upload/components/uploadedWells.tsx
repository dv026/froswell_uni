import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Column, Table, TableRowProps } from 'react-virtualized';
import { useRecoilValue } from 'recoil';

import { EmptyData } from '../../common/components/emptyData';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { cls } from '../../common/helpers/styles';
import { headerRowRenderer, markRenderer, oilWellRenderer } from '../helpers/tableHelper';
import { uploadedWells } from '../store/uploadedWells';

import css from '../UploadPage.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

const rowRenderer = (props: TableRowProps) => {
    const selected =
        props.rowData.mer &&
        props.rowData.rigis &&
        props.rowData.perforation &&
        props.rowData.plastCrossing &&
        props.rowData.research
            ? false
            : true;

    return (
        <div className={cls(props.className, selected && css.selected)} style={props.style}>
            {props.columns}
        </div>
    );
};

export const UploadedWells = () => {
    const { t } = useTranslation();

    const wells = useRecoilValue(uploadedWells);

    if (isNullOrEmpty(wells)) {
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
                rowCount={wells.length}
                rowGetter={({ index }) => wells[index]}
            >
                <Column label={t(dict.common.well)} dataKey='wellName' width={100} cellRenderer={oilWellRenderer} />
                <Column
                    label={t(dict.common.object)}
                    dataKey='productionObjectName'
                    width={200}
                    cellRenderer={oilWellRenderer}
                />
                <Column label={t(dict.common.plast)} dataKey='plastName' width={100} cellRenderer={oilWellRenderer} />
                <Column label={t(dict.load.mer)} dataKey='mer' width={150} cellRenderer={markRenderer} />
                <Column label={t(dict.load.rigis)} dataKey='rigis' width={150} cellRenderer={markRenderer} />
                <Column
                    label={t(dict.load.perforation)}
                    dataKey='perforation'
                    width={150}
                    cellRenderer={markRenderer}
                />
                <Column
                    label={t(dict.load.plastCrossing)}
                    dataKey='plastCrossing'
                    width={150}
                    cellRenderer={markRenderer}
                />
                <Column label={t(dict.load.research)} dataKey='research' width={150} cellRenderer={markRenderer} />
                <Column label={t(dict.load.repairs)} dataKey='repairs' width={150} cellRenderer={markRenderer} />
            </Table>
        </Box>
    );
};
