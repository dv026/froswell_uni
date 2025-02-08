import React, { FC, useState } from 'react';

import { Box, Stack, Text } from '@chakra-ui/react';
import i18n from 'i18next';
import { any, concat, filter, includes, last, map, pipe, sortBy } from 'ramda';
import { CartesianGrid, Label, Line, ReferenceLine, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import colors from '../../../../../theme/colors';
import { AxesY, Chart } from '../../../../common/components/chart';
import { getAxisLabel } from '../../../../common/components/charts/axes';
import { HorizontalLegend } from '../../../../common/components/charts/legends/horizontalLegend';
import { DoubleParameter } from '../../../../common/components/charts/legends/parameter';
import { ChartIcon } from '../../../../common/components/customIcon/general';
import { ChartParamEnum } from '../../../../common/enums/chartParamEnum';
import { round, round2 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { px } from '../../../../common/helpers/styles';
import { Coefficients } from '../entities/coefficients';
import { Permeability, PermeabilityChartModel } from '../entities/permeability';
import { calcPermeabilities, findJumpPoint } from '../helpers/permeabilityCalculator';
import { dataState } from '../store/data';
import { paramsState } from '../store/params';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const columns: ChartProp[] = [
    {
        id: 1,
        name: 'kro',
        color: colors.colors.brown,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.OilPermeability),
        yAxisId: 'left',
        type: ChartParamEnum.Oil
    },
    {
        id: 2,
        name: 'krw',
        color: colors.colors.darkblue,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.WaterPermeability),
        yAxisId: 'left',
        type: ChartParamEnum.InjectionRate
    },
    {
        id: 3,
        name: 'fbl',
        color: colors.colors.green,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.FBL),
        yAxisId: 'left',
        type: ChartParamEnum.BuckleyLeverettFunction
    },
    {
        id: 4,
        name: 'dfbl',
        color: colors.icons.main,
        isKnown: false,
        title: i18n.t(dict.proxy.permeabilities.params.DFBL),
        yAxisId: 'right',
        type: ChartParamEnum.BuckleyLeverettDerivativeFunction
    }
];

export const ChartData = () => {
    const data = useRecoilValue(dataState);
    const params = useRecoilValue(paramsState);

    const allColumns = addKnownProps(columns);

    const [displayed, setDisplayed] = useState(allColumns);

    if (!data || isNullOrEmpty(data.known)) {
        return (
            <Text color='typo.secondary'>
                <ChartIcon boxSize={8} /> {i18n.t(dict.proxy.permeabilities.calculatToDisplayGraph)}.
            </Text>
        );
    }

    const title = (value: number) => `${i18n.t(dict.proxy.permeabilities.jumpPoint)} (${round(value, 2)})`;

    const onLegendClick = (item: ChartProp) => {
        setDisplayed(
            includes(item, displayed)
                ? displayed.filter(obj => obj.id !== item.id)
                : displayed.concat(allColumns.filter(x => x.id === item.id))
        );
    };

    const viewData = makeViewData(data.known, data.constants, params.stepSize, displayed);

    return (
        <Box w='900px' h='400px'>
            <Chart data={viewData.data}>
                <CartesianGrid strokeDasharray='2 2' />
                <XAxis dataKey='s' type='number' tickFormatter={(v: number) => round2(v).toString()} domain={[0, 1]} />

                <YAxis
                    yAxisId='left'
                    type='number'
                    orientation='left'
                    domain={viewData.domainRange}
                    tickFormatter={(v: number) => round2(v).toString()}
                    label={getAxisLabel(i18n.t(dict.proxy.permeabilities.labels.permeabilityAndFBL), 'left')}
                />
                <YAxis
                    yAxisId='right'
                    type='number'
                    orientation='right'
                    domain={viewData.domainRangeDfbl}
                    tickFormatter={(v: number) => round2(v).toString()}
                    label={getAxisLabel(i18n.t(dict.proxy.permeabilities.labels.DFBL), 'right')}
                />

                <ReferenceLine
                    x={viewData.jumpPointX}
                    stroke={colors.control.grey400}
                    strokeWidth={2}
                    strokeDasharray='10 4'
                    yAxisId={'left'}
                >
                    <Label position='top' value={title(viewData.jumpPointX)} offset={10} />
                </ReferenceLine>

                {viewData.lines}
                {viewData.points}
            </Chart>
            <HorizontalLegend>
                <Stack fontSize='sm' justifyContent='center' spacing={1} mt={'15px'}>
                    <Box>{i18n.t(dict.proxy.permeabilities.labels.kern)}:</Box>
                    <Box>{i18n.t(dict.proxy.permeabilities.labels.calculation)}:</Box>
                </Stack>
                {map(
                    (it: ChartProp) => (
                        <DoubleParameter
                            key={it.name}
                            title={it.title}
                            type={it.type}
                            visible={any(x => x === it, displayed)}
                            dashed={false}
                            isDot={true}
                            onClick={() => onLegendClick(it)}
                        />
                    ),
                    columns
                )}
            </HorizontalLegend>
        </Box>
    );
};

const makeViewData = (known: Permeability[], constants: Coefficients, stepSize: number, displayed: ChartProp[]) => {
    const calculated = calcPermeabilities(constants, stepSize);
    const jumpPoint = findJumpPoint(calculated, constants.swr);

    const knownPoints = map(PermeabilityChartModel.knownFromEntity, known);

    return {
        data: sortBy(x => x.s, calculated),
        domainRange: [0, 1] as [number, number],
        domainRangeDfbl: [0, Math.round(last(sortBy(x => x.dfbl, calculated)).dfbl + 1)] as [number, number],
        lines: makeLines(displayed),
        points: makePoints(knownPoints, displayed),
        jumpPointX: jumpPoint.s
    };
};

/**
 * Линия, отображающая рассчитанные значения параметра
 * @param propName название параметра
 * @param color цвет линии
 * @param yId ид оси Y, к которой привязываются значения параметра
 */
const calculatedLine = (propName: string, color: string, yId: string = 'left') => (
    <Line
        key={propName}
        type='monotone'
        dataKey={propName}
        yAxisId={yId}
        stroke={color}
        strokeWidth={px(2)}
        dot={false}
        isAnimationActive={false}
    />
);

/**
 * Линия, отображающая известные значения параметра
 * @param propName название параметра
 * @param color цвет линии
 * @param yId ид оси Y, к которой привязываются значения параметра
 */
const knownLine = (data: PermeabilityChartModel[], propName: string, color: string, yId: string = 'left') => (
    <Line
        data={data}
        key={propName}
        dataKey={propName}
        yAxisId={yId}
        stroke='transparent'
        dot={{ stroke: 'none', fill: color, r: 4 }}
        isAnimationActive={false}
    />
);

const makeLines = (displayed: ChartProp[]) =>
    map(
        (x: ChartProp) => calculatedLine(x.name, x.color, x.yAxisId),
        filter(x => !x.isKnown, displayed)
    );

const makePoints = (data: PermeabilityChartModel[], displayed: ChartProp[]) =>
    map(
        (x: ChartProp) => knownLine(data, x.name, x.color, x.yAxisId),
        filter(x => x.isKnown, displayed)
    );

interface ChartProp {
    color: string;
    id: number;
    isKnown: boolean;
    name: string;
    title: string;
    type: ChartParamEnum;
    yAxisId: AxesY;
}

const createKnownProp = (p: ChartProp): ChartProp => ({
    color: p.color,
    id: p.id,
    isKnown: true,
    name: `${p.name}Known`,
    title: p.title,
    type: p.type,
    yAxisId: p.yAxisId
});

const addKnownProps = (props: ChartProp[]): ChartProp[] => pipe(map(createKnownProp), concat(props))(props);
