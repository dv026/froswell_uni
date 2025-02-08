import React from 'react';

import { Box } from '@chakra-ui/react';
import { PlastModel } from 'common/entities/plastModel';
import * as R from 'ramda';
import { XAxis, YAxis, Legend, Area, Tooltip } from 'recharts';

import colors from '../../../../theme/colors';
import { Chart } from '../../../common/components/chart';
import { PropertyTooltip } from '../../../common/components/charts/tooltips/propertyTooltip';
import { ModeMapEnum } from '../../../common/enums/modeMapEnum';
import { ddmmyyyy, mmyyyy } from '../../../common/helpers/date';
import { round1 } from '../../../common/helpers/math';
import { mapIndexed } from '../../../common/helpers/ramda';
import { PlastDistributionModel } from '../../entities/plastDistributionModel';

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

interface Props {
    data: PlastDistributionModel[];
    dataMode: ModeMapEnum;
    label?: string;
    plasts: PlastModel[];
    unit: string;
}

export const PlastDistributionChart: React.FC<Props> = (p: Props) => {
    const renderPercentAreas = () => {
        const getVal = (obj: PlastDistributionModel, id) => {
            const item = R.find(it => it.plastId === id, obj.details);
            return !R.isNil(item) ? item.value : null;
        };

        const getName = (index: number) => (p.plasts && index <= p.plasts.length - 1 ? p.plasts[index].name : '');

        const generateDataSeries = (variable, index) => (
            <Area
                type='monotone'
                dataKey={val => getVal(val, variable)}
                name={getName(index)}
                stackId='1'
                yAxisId='left'
                stroke={cPalette[index]}
                fill={cPalette[index]}
                isAnimationActive={false}
            />
        );

        return mapIndexed((it: PlastModel, index) => generateDataSeries(it.id, index), p.plasts);
    };

    const tooltipLabelFormatter = payload => ddmmyyyy(new Date(payload));
    const tooltipFormatter = value => `${round1(value)}${p.unit}`;

    return (
        <Box className='prediction__chart' width='100%'>
            <Chart
                {...p}
                className='chart chart_property-plan-fact chart_plast-distribution'
                composed={true}
                rangeDataKey='oilrateCalc'
                rangeStroke={colors.paramColors.oil}
                rangeXAxisDataKey='date'
                disabledZoom={true}
            >
                <>
                    <XAxis dataKey='dt' tickFormatter={v => mmyyyy(new Date(v))} />
                    <YAxis
                        yAxisId='left'
                        type='number'
                        orientation='left'
                        tickCount={8}
                        label={{
                            value: p.unit,
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />

                    {renderPercentAreas()}

                    <Tooltip
                        content={<PropertyTooltip />}
                        isAnimationActive={false}
                        labelFormatter={tooltipLabelFormatter}
                        formatter={tooltipFormatter}
                    />

                    <Legend
                        verticalAlign='bottom'
                        align='center'
                        iconType='square'
                        payload={mapIndexed(
                            (pair: PlastModel, index) => ({
                                dataKey: pair.id,
                                value: pair.name,
                                color: cPalette[index],
                                type: 'square'
                            }),
                            p.plasts
                        )}
                    />
                </>
            </Chart>
        </Box>
    );
};
