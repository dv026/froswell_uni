import React from 'react';

import i18n from 'i18next';
import { any, isNil, tail, values } from 'ramda';
import { TableHeaderRowProps, TableCellProps } from 'react-virtualized';

import { CompleteIcon, ErrorIcon } from '../../common/components/customIcon/general';
import { cls } from '../../common/helpers/styles';
import { AvailableBrandTool } from '../enums/availableBrandTool';

import css from '../UploadPage.module.less';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const headerRowRenderer = (cell: TableHeaderRowProps): React.ReactNode => (
    <div className={cell.className} role='row' style={cell.style}>
        {cell.columns}
    </div>
);

export const oilWellRenderer = (cell: TableCellProps): React.ReactNode => {
    if (!cell.rowData) {
        return null;
    }

    return (
        <div className={css.cellData}>
            <div>{cell.cellData || ''}</div>
        </div>
    );
};

export const cellRenderer = (cell: TableCellProps): React.ReactNode => {
    const sign = cell.cellData ? '+' : '-';
    return (
        <div className={css.cellData}>
            <div>{sign}</div>
        </div>
    );
};

export const markRenderer = (cell: TableCellProps): React.ReactNode => {
    const isEmpty = isNil(cell.cellData);
    //const classes = cell.cellData ? 'glyphicon-ok-circle blue' : 'glyphicon-remove-circle red';

    return (
        <div className={cls(css.cellData, css.mark, isEmpty && css.empty)}>
            <div>
                {!isEmpty &&
                    (cell.cellData ? (
                        <CompleteIcon color='icons.green' boxSize={7} />
                    ) : (
                        <ErrorIcon color='icons.red' boxSize={7} />
                    ))}
            </div>
        </div>
    );

    // return (
    //     <div className={StyleHelper.className('cell-data', isEmpty ? 'empty' : '')}>
    //         <div>
    //             {!isEmpty ? <span className={StyleHelper.className('glyphicon', classes)} aria-hidden='true' /> : null}
    //         </div>
    //     </div>
    // );
};

export const brandToolRenderer = (cell: TableCellProps): React.ReactNode => {
    const val = tail(values(cell.rowData));
    const allow = !any(it => it === false, val);
    return (
        <div className={cls(css.cellData, css.cellTool, allow && css.allow)}>
            <div>{toolName(cell.cellData as AvailableBrandTool)}</div>
            {!allow && <div className={cls(css.smallIcon, css.glyphicon, css.red, 'glyphicon-remove-circle')} />}
        </div>
    );
};

const toolName = (tool: AvailableBrandTool) => {
    switch (tool) {
        case AvailableBrandTool.DynamicChart:
        case AvailableBrandTool.PredictionDynamicChart:
            return i18n.t(dict.load.wellDynamicsGraphs);
        case AvailableBrandTool.Tablet:
            return i18n.t(dict.load.tablet);
        case AvailableBrandTool.BuildingMap:
            return i18n.t(dict.load.buildingDevelopmentMaps);
        case AvailableBrandTool.GeologicalMap:
            return i18n.t(dict.load.constructionGeologicalMaps);
        case AvailableBrandTool.CreationModel:
            return i18n.t(dict.load.modelCreationAdaptation);
        case AvailableBrandTool.WellGrid:
            return i18n.t(dict.load.wellGridCreation);
        case AvailableBrandTool.Prediction:
            return i18n.t(dict.load.developmentPrediction);
        case AvailableBrandTool.Optimization:
            return i18n.t(dict.load.developmentOptimization);
        case AvailableBrandTool.MappingResidualOilReserves:
            return i18n.t(dict.load.mappingResidualOilReserves);
        default:
            return '';
    }
};
