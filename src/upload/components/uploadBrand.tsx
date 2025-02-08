import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { filter, includes, isNil, map, sum } from 'ramda';
import { Column, ColumnProps, Index, Table } from 'react-virtualized';
import { useRecoilValue } from 'recoil';

import { EmptyData } from '../../common/components/emptyData';
import i18n from '../../common/helpers/i18n';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { cls } from '../../common/helpers/styles';
import { UploadedBrand } from '../entities/uploadedBrand';
import { AvailableBrandTool } from '../enums/availableBrandTool';
import { brandToolRenderer, headerRowRenderer, markRenderer } from '../helpers/tableHelper';
import { oilFieldPropertiesSelector } from '../store/oilFieldProperties';
import { uploadedAvailableTools } from '../store/uploadedAvailableTools';

import css from '../UploadPage.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

const headerColumns: Array<ColumnProps> = [
    {
        dataKey: 'tool',
        label: i18n.t(dict.load.tool),
        className: 'header-tool',
        width: 170,
        cellRenderer: brandToolRenderer
    },
    { dataKey: 'mer', label: i18n.t(dict.load.mer), width: 92, cellRenderer: markRenderer },
    {
        dataKey: 'physicalProperties',
        label: i18n.t(dict.load.physicalProperties),
        width: 92,
        cellRenderer: markRenderer
    },
    { dataKey: 'rigis', label: i18n.t(dict.load.rigis), width: 92, cellRenderer: markRenderer },
    { dataKey: 'research', label: i18n.t(dict.load.research), width: 100, cellRenderer: markRenderer },
    { dataKey: 'repairs', label: i18n.t(dict.load.repairs), width: 100, cellRenderer: markRenderer },
    { dataKey: 'perforation', label: i18n.t(dict.load.perforation), width: 100, cellRenderer: markRenderer },
    { dataKey: 'grids', label: i18n.t(dict.load.grids), width: 100, cellRenderer: markRenderer },
    {
        dataKey: 'plastCrossing',
        label: i18n.t(dict.load.plastCrossing),
        width: 100,
        cellRenderer: markRenderer
    },
    {
        dataKey: 'contours',
        label: i18n.t(dict.load.contours),
        width: 120,
        cellRenderer: markRenderer
    },
    {
        dataKey: 'geologicalProperties',
        label: i18n.t(dict.load.geologicalProperties),
        width: 120,
        cellRenderer: markRenderer
    },
    { dataKey: 'permeabilities', label: i18n.t(dict.load.permeability), width: 120, cellRenderer: markRenderer }
];

export const UploadBrand = () => {
    const data = useRecoilValue(uploadedAvailableTools);
    const properties = useRecoilValue(oilFieldPropertiesSelector);

    if (isNullOrEmpty(data) || isNil(properties)) {
        return <EmptyData />;
    }

    const common = {
        uploadedBrandInput: uploadedBrandInput(data),
        uploadedBrandFiltration: uploadedBrandFiltration(data),
        uploadedBrandProxy: uploadedBrandProxy(data),
        uploadedBrandPrediction: uploadedBrandPrediction(data)
    };

    return (
        <Box className={css.page__content}>
            <div className={css.uploadContainer}>
                <div className={css.uploadContent}>
                    <div className={css.main__content}>
                        <div className={css.content__table}>
                            <CommonHeader />
                        </div>
                        <div className={css.content__row}>
                            <div className={css.nest__group}>{i18n.t(dict.stairway.input)}</div>
                        </div>
                        <div className={css.content__table}>
                            <CommonData data={common.uploadedBrandInput} width={[55, 30, 40, 55]} />
                        </div>
                        <div className={css.content__row}>
                            <div className={css.nest__group}>{i18n.t(dict.stairway.filtering)}</div>
                        </div>
                        <div className={css.content__table}>
                            <CommonData data={common.uploadedBrandFiltration} width={[55]} />
                        </div>
                        <div className={css.content__row}>
                            <div className={css.nest__group}>{i18n.t(dict.stairway.proxy)}</div>
                        </div>
                        <div className={css.content__table}>
                            <CommonData data={common.uploadedBrandProxy} width={[40, 40, 40, 40]} />
                        </div>
                        <div className={css.content__row}>
                            <div className={css.nest__group}>{i18n.t(dict.stairway.prediction)}</div>
                        </div>
                        <div className={css.content__table}>
                            <CommonData data={common.uploadedBrandPrediction} width={[55, 80]} />
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
};

const CommonHeader = () => (
    <Table
        className={css.uploadTable}
        width={1200}
        height={null}
        headerHeight={75}
        rowHeight={null}
        headerClassName={cls(css.headerCell, css.headerSingle)}
        rowClassName={css.rowCell}
        headerRowRenderer={headerRowRenderer}
        rowCount={0}
    >
        {map(
            it => (
                <Column key={it.dataKey} {...it} />
            ),
            headerColumns
        )}
    </Table>
);

interface UploadDataProps {
    data: UploadedBrand[];
    width: number[];
}

const CommonData: FC<UploadDataProps> = (props: UploadDataProps) => {
    if (isNil(props.data)) {
        return null;
    }

    const getRowHeight = (info: Index) => props.width[info.index] || 60;

    return (
        <Table
            disableHeader={true}
            className={css.uploadTable}
            width={1200}
            height={sum(props.width)}
            headerHeight={75}
            rowHeight={getRowHeight}
            headerClassName={css.headerCell}
            rowClassName={css.rowCell}
            headerRowRenderer={headerRowRenderer}
            rowCount={props.data.length}
            rowGetter={({ index }) => props.data[index]}
        >
            {map(
                it => (
                    <Column key={it.dataKey} {...it} />
                ),
                headerColumns
            )}
        </Table>
    );
};

const uploadedBrandInput = (data: UploadedBrand[]): UploadedBrand[] => {
    if (isNil(data)) {
        return null;
    }

    const list = [
        AvailableBrandTool.DynamicChart,
        AvailableBrandTool.Tablet,
        AvailableBrandTool.BuildingMap,
        AvailableBrandTool.GeologicalMap
    ];
    return filter(it => includes(it.tool, list), data);
};

const uploadedBrandFiltration = (data: UploadedBrand[]): UploadedBrand[] => {
    if (isNil(data)) {
        return null;
    }

    const list = [AvailableBrandTool.DynamicChart];
    return filter(it => includes(it.tool, list), data);
};

const uploadedBrandProxy = (data: UploadedBrand[]): UploadedBrand[] => {
    if (isNil(data)) {
        return null;
    }

    const list = [
        AvailableBrandTool.CreationModel,
        AvailableBrandTool.WellGrid,
        AvailableBrandTool.Prediction,
        AvailableBrandTool.Optimization
    ];
    return filter(it => includes(it.tool, list), data);
};

const uploadedBrandPrediction = (data: UploadedBrand[]): UploadedBrand[] => {
    if (isNil(data)) {
        return null;
    }

    const list = [AvailableBrandTool.PredictionDynamicChart, AvailableBrandTool.MappingResidualOilReserves];
    return filter(it => includes(it.tool, list), data);
};
