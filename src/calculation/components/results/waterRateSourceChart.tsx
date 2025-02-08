import React, { useMemo, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { WaterRateSourceRaw } from 'calculation/entities/waterRateSourceRaw';
import { HorizontalLegend } from 'common/components/charts/legends/horizontalLegend';
import { Parameter } from 'common/components/charts/legends/parameter';
import { PlastModel } from 'common/entities/plastModel';
import { px } from 'common/helpers/styles';
import { any, ascend, forEach, forEachObjIndexed, includes, map, prop, reject, sortWith, uniq } from 'ramda';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, Tooltip, Line } from 'recharts';

import colors from '../../../../theme/colors';
import { Chart } from '../../../common/components/chart';
import { PropertyTooltip } from '../../../common/components/charts/tooltips/propertyTooltip';
import { ddmmyyyy } from '../../../common/helpers/date';
import { round1 } from '../../../common/helpers/math';
import { groupByProp, mapIndexed } from '../../../common/helpers/ramda';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

const cPalette = [
    colors.colors.orange,
    colors.colors.yellow,
    colors.colors.red,
    colors.colors.blue,
    colors.colors.darkblue,
    colors.colors.green,
    colors.colors.pink,
    colors.colors.seagreen,
    colors.colors.brown,
    colors.colors.turquoise,
    colors.colors.lightblue,
    colors.colors.lightyellow
];

const pLine = (propName: string, color: string, median: boolean = true): JSX.Element => (
    <Line
        key={propName}
        type='monotone'
        dataKey={propName}
        yAxisId='left'
        strokeWidth={px(median ? 3 : 2)}
        strokeDasharray={median ? undefined : `${px(11)} ${px(8)}`}
        stroke={color}
        dot={false}
        isAnimationActive={false}
    />
);

interface Props {
    data: WaterRateSourceRaw[];
    plasts: PlastModel[];
    dataKey: string;
}

export const WaterRateSourceChart: React.FC<Props> = (props: Props) => {
    const { data, dataKey } = props;

    const { t } = useTranslation();

    const [hiddenLines, setHiddenLines] = useState<string[]>([]);

    const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
    const tooltipFormatter = value => `${round1(value)}`;

    const sortByPlastNumber = list => sortWith<WaterRateSourceRaw>([ascend(prop('dt'))], list);

    const getColumnTitle = (column: string) =>
        column === '0'
            ? t(dict.common.waterFrom.bottom)
            : includes(column, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
            ? t(dict.common.waterFrom.contour)
            : column;

    const yAxisLabel = `${
        dataKey === 'waterRate' ? t(dict.calculation.waterExtraction) : t(dict.calculation.fluidInflux)
    }, ${t(dict.common.units.m3PerDay)}`;

    const result = [];
    let columns = [];

    forEachObjIndexed((g: any, key) => {
        const item = { dt: key };
        forEach((it: WaterRateSourceRaw) => {
            const columnName = getColumnTitle(it.neighborName);
            item[columnName] = it[dataKey];
            columns.push(columnName);
        }, g);
        result.push(item);
    }, groupByProp('dt', sortByPlastNumber(data)));

    columns = uniq(columns);

    const renderLines = (lines: JSX.Element[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return reject(x => any(hidden => hidden === (x as unknown as any).props.dataKey, hiddenLines), lines);
    };

    return (
        <Box className='prediction__chart' width='100%'>
            <Chart
                data={result}
                className='chart chart_property-plan-fact chart_plast-distribution'
                composed={true}
                disabledZoom={true}
            >
                <>
                    <XAxis dataKey='dt' tickFormatter={v => ddmmyyyy(new Date(v))} />
                    <YAxis
                        yAxisId='left'
                        type='number'
                        orientation='left'
                        tickCount={8}
                        label={{
                            value: yAxisLabel,
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />

                    {renderLines(mapIndexed((it: string, index: number) => pLine(it, cPalette[index]), columns))}

                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        labelFormatter={tooltipLabelFormatter}
                        formatter={tooltipFormatter}
                    />
                </>
            </Chart>
            <HorizontalLegend>
                {mapIndexed(
                    (it: string, index: number) => (
                        <Parameter
                            key={it}
                            title={it}
                            color={cPalette[index]}
                            visible={true}
                            dashed={false}
                            onClick={() => {}}
                        />
                    ),
                    columns
                )}
            </HorizontalLegend>
        </Box>
    );
};
