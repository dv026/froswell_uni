import React from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { AutoSizer, GridCellProps, MultiGrid } from 'react-virtualized';

import { digitsAfterDot, even, round } from '../../../../../common/helpers/math';
import { cls } from '../../../../../common/helpers/styles';
import { Coefficients } from '../../entities/coefficients';
import { Permeability } from '../../entities/permeability';
import { calcPermeabilities, findJumpPoint } from '../../helpers/permeabilityCalculator';
import { Cell, NumericCell } from './cell';

import css from './index.module.less';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface GridProps {
    constants: Coefficients;
    stepSize: number;
}

interface GridState {
    detailedMode: boolean;
}

export class Grid extends React.Component<GridProps, GridState> {
    public constructor(props: GridProps, context: unknown) {
        super(props, context);

        this.state = {
            detailedMode: false
        };
    }

    public shouldComponentUpdate(nextProps: GridProps): boolean {
        // не обновлять грид в том случае, если обновилась степень округления S, но при этом не
        // поменялись данные (задан новый шаг построения, но не нажата кнопка выполнения расчета)
        if (this.props.constants === nextProps.constants && this.props.stepSize !== nextProps.stepSize) {
            return false;
        }

        return true;
    }

    public render(): JSX.Element {
        const roundLevel = digitsAfterDot(this.props.stepSize);
        const data = calcPermeabilities(this.props.constants, this.props.stepSize);
        const inBounds = (x: Permeability) =>
            round(x.s, roundLevel) >= round(this.props.constants.swr, roundLevel) &&
            round(x.s, roundLevel) <= round(1 - this.props.constants.sor, roundLevel);

        const columns = makeColumns();
        const filteredData = R.filter(inBounds, data);

        return (
            <AutoSizer className={css.grid}>
                {({ width, height }) => (
                    <MultiGrid
                        rowCount={filteredData.length + 3}
                        columnCount={5}
                        rowHeight={33}
                        width={width}
                        height={height}
                        columnWidth={150}
                        cellRenderer={(p: GridCellProps) => this.renderCell(p, columns, filteredData)}
                        fixedRowCount={4}
                    />
                )}
            </AutoSizer>
        );
    }

    private renderCell(p: GridCellProps, columns: ColumnType[], filteredData: Permeability[]): JSX.Element {
        const column = findColumnByIdx(p.columnIndex, columns);

        // первые две строки - хэдер.
        // Первая строка имеет двойную высоту, поэтому во второй строке не отображать ничего
        if (p.rowIndex === 0) {
            return (
                <Cell
                    key={p.key}
                    style={extractStyles(p.style)}
                    className={cls(css.cell, css.cell_header, css.cell_y2)}
                >
                    <div className={cls(css.cell__title)}>{column.title}</div>
                </Cell>
            );
        }

        if (p.rowIndex === 1) {
            return null;
        }

        // третья строка - заголовок точки скачка
        if (p.rowIndex === 2) {
            if (p.columnIndex !== 0) {
                return null;
            }

            return (
                <Cell key={p.key} style={extractStyles(p.style)} className={cls(css.cell, css.cell_total, css.cell_x5)}>
                    <div className={cls(css.cell__title, css.cell__title_center)}>
                        {i18n.t(dict.proxy.permeabilities.jumpPoint)}
                    </div>
                </Cell>
            );
        }

        const round = R.cond([
            [R.equals(ColumnTypeEnum.WaterSaturation), () => digitsAfterDot(this.props.stepSize)],
            [R.equals(ColumnTypeEnum.OilPermeability), R.always(4)],
            [R.equals(ColumnTypeEnum.WaterPermeability), R.always(4)],
            [R.T, R.always(5)]
        ])(column.key);

        const value = (key: ColumnTypeEnum, x: Permeability): number =>
            R.cond([
                [R.equals(ColumnTypeEnum.WaterSaturation), () => x.s],
                [R.equals(ColumnTypeEnum.OilPermeability), () => x.kro],
                [R.equals(ColumnTypeEnum.WaterPermeability), () => x.krw],
                [R.equals(ColumnTypeEnum.FBL), () => x.fbl],
                [R.equals(ColumnTypeEnum.DFBL), () => x.dfbl]
            ])(key);

        // четвертая строка - параметры точки скачка
        if (p.rowIndex === 3) {
            const jumpPoint = findJumpPoint(filteredData, this.props.constants.swr);

            return (
                <NumericCell
                    key={p.key}
                    style={extractStyles(p.style)}
                    className={(css.cell, css.cell_total)}
                    value={value(column.key, jumpPoint)}
                    round={round}
                />
            );
        }

        const className = cls([css.cell, even(p.rowIndex) ? null : css.cell_odd]);

        // "обычные" строки - строки с параметрами проводимостей
        return (
            <NumericCell
                key={p.key}
                style={extractStyles(p.style)}
                className={className}
                value={value(column.key, filteredData[p.rowIndex - 3])}
                round={round}
            />
        );
    }
}

export const extractStyles = (raw: React.CSSProperties): React.CSSProperties => ({ left: raw.left, top: raw.top });

enum ColumnTypeEnum {
    WaterSaturation = 0,
    WaterPermeability = 1,
    OilPermeability = 2,
    FBL = 3,
    DFBL = 4
}

interface ColumnType {
    idx: number;
    key: ColumnTypeEnum;
    title: string;
}

const makeColumns = (): ColumnType[] => [
    { idx: 0, key: ColumnTypeEnum.WaterSaturation, title: i18n.t(dict.proxy.permeabilities.params.WaterSaturation) },
    { idx: 1, key: ColumnTypeEnum.OilPermeability, title: i18n.t(dict.proxy.permeabilities.params.OilPermeability) },
    {
        idx: 2,
        key: ColumnTypeEnum.WaterPermeability,
        title: i18n.t(dict.proxy.permeabilities.params.WaterPermeability)
    },
    { idx: 3, key: ColumnTypeEnum.FBL, title: i18n.t(dict.proxy.permeabilities.params.FBL) },
    { idx: 4, key: ColumnTypeEnum.DFBL, title: i18n.t(dict.proxy.permeabilities.params.DFBL) }
];

const findColumnByIdx = (idx: number, columns: ColumnType[]) => R.find(x => x.idx === idx, columns);
