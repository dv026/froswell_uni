import React, { useCallback, useEffect, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { any, concat, filter, includes, is, isNil, map, pipe, reject, split, takeLast, test, without } from 'ramda';
import { AutoSizer } from 'react-virtualized';
import { CartesianGrid, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import { ChartDateRange } from '../../../../../common/components/chartDateRange';
import { ParamDate } from '../../../../../common/entities/paramDate';
import { Range } from '../../../../../common/entities/range';
import { gteByMonth, lteByMonth, parseShortRU } from '../../../../../common/helpers/date';
import { round, round0 } from '../../../../../common/helpers/math';
import { cls } from '../../../../../common/helpers/styles';
import { ChartViewData } from '../../entities/chartBuilder';
import { GraphViewParam } from '../../enums/graphViewParam';
import { currentModeSelector } from '../../store/currentMode';
import { reportState } from '../../store/report';
import { viewTypeSelector } from '../../store/viewType';
import { сurrentParamIdState } from '../../store/сurrentParamId';
import { FrontTrackingChart } from '../insimCharts/frontTrackingChart';
import { MinByDateSaturationChart } from '../insimCharts/minByDateSaturationChart';
import { ModuleAccumOilPlanFactChart } from '../moduleAccumOilPlanFactChart';
import { ModuleLiqRateSourceChart } from '../moduleLiqRateSourceChart';
import { ModuleLiquidBalanceChart } from '../moduleLiquidBalanceChart';
import { ModulePlastDistributionChart } from '../modulePlastDistributionChart';
import { ModuleProductionCalculationChart } from '../moduleProductionCalculationChart';
import { ModuleRelativePermeabilityChart } from '../moduleRelativePermeabilityChart';
import { ModuleWaterRateSourceChart } from '../moduleWaterRateSourceChart';

import commonCss from './../common.module.less';
import css from './index.module.less';

export const ChartData = () => {
    const currentMode = useRecoilValue(currentModeSelector);
    const currentParamId = useRecoilValue(сurrentParamIdState);
    const report = useRecoilValue(reportState);
    const viewType = useRecoilValue(viewTypeSelector);

    const [hiddenLines, setHiddenLines] = useState<string[]>([]);
    const [viewData, setViewData] = useState<ChartViewData>();
    const [initialRangeData, setInitialRangeData] = useState<ParamDate[]>();
    const [data, setData] = useState([]);

    const updateLines = useCallback(
        (lines: string[] | string): void => {
            if (is(String)(lines)) {
                lines = [lines as string];
            }

            setHiddenLines(
                any(x => x === lines[0], hiddenLines)
                    ? without(lines as string[], hiddenLines) // убрать из скрытых линий -> отобразить
                    : concat(lines as string[], hiddenLines) // добавить в скрытые линии -> скрыть
            );
        },
        [hiddenLines]
    );

    useEffect(() => {
        const model = currentMode?.render(
            report?.insim?.adaptations ?? [],
            report.dataType,
            hiddenLines,
            (lines: string[] | string) => updateLines(lines)
        );

        setViewData(model);

        setInitialRangeData(
            map(it => ParamDate.fromRaw({ dt: parseShortRU(it.date), value: it.oilrateCalc }), model?.data ?? [])
        );
        setData(model?.data);
    }, [report, hiddenLines, currentMode, updateLines]);

    const onChangeRangeHandler = useCallback(
        (current: Range<Date>) => {
            setData(
                filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (x: any) =>
                        gteByMonth(parseShortRU(x.date), current.min) && lteByMonth(parseShortRU(x.date), current.max),
                    viewData.data ?? []
                )
            );
        },
        [viewData?.data]
    );

    if (!currentParamId) {
        return null;
    }

    if (!currentMode && includes('fronttracking', currentParamId)) {
        const params = takeLast(2, split('-', currentParamId));
        return <FrontTrackingChart neighborId={+params[1]} plastId={+params[0]} />;
    }

    if (!currentMode && includes('minl', currentParamId)) {
        const params = takeLast(2, split('-', currentParamId));
        return <MinByDateSaturationChart neighborId={+params[1]} plastId={+params[0]} />;
    }

    if (
        includes(GraphViewParam.PlastDistributionPercent, currentParamId) ||
        includes(GraphViewParam.PlastDistribution, currentParamId)
    ) {
        return (
            <Box className={commonCss.results__chart}>
                <ModulePlastDistributionChart />
            </Box>
        );
    }

    if (includes(GraphViewParam.WaterRateSource, currentParamId)) {
        return (
            <Box className={commonCss.results__chart}>
                <ModuleWaterRateSourceChart />
            </Box>
        );
    }

    if (includes(GraphViewParam.LiqRateSource, currentParamId)) {
        return (
            <Box className={commonCss.results__chart}>
                <ModuleLiqRateSourceChart />
            </Box>
        );
    }

    if (includes(GraphViewParam.ReserveDevelopment, currentParamId)) {
        const params = takeLast(2, split('-', currentParamId));
        const plastId = params[1] ? Number(params[1]) : null;

        return <ModuleProductionCalculationChart plastId={plastId} currentParamId={currentParamId} />;
    }

    if (includes(GraphViewParam.RelativePermeability, currentParamId)) {
        return (
            <Box className={commonCss.results__chart}>
                <ModuleRelativePermeabilityChart />
            </Box>
        );
    }

    if (includes(GraphViewParam.AccumOilPlanFact, currentParamId)) {
        return (
            <Box className={commonCss.results__chart}>
                <ModuleAccumOilPlanFactChart />
            </Box>
        );
    }

    if (includes(GraphViewParam.LiquidBalance, currentParamId)) {
        return (
            <Box className={commonCss.results__chart}>
                <ModuleLiquidBalanceChart />
            </Box>
        );
    }

    const renderLines = (lines: JSX.Element[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return reject(x => any(hidden => hidden === (x as unknown as any).props.dataKey, hiddenLines), lines);
    };

    return (
        <>
            <Box className={commonCss.results__chart}>
                <AutoSizer>
                    {({ width, height }) =>
                        width && height ? (
                            <LineChart
                                width={width}
                                height={height}
                                className={cls(['chart', viewData.rootClass])}
                                data={data}
                                margin={{ top: 30, right: 30, left: 30, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray='1 0' vertical={false} stroke='#A6A6A6' />
                                <XAxis dataKey='date' />
                                <YAxis
                                    yAxisId='left'
                                    type='number'
                                    orientation='left'
                                    domain={viewData.domainRange}
                                    tickFormatter={viewData.tickFormatterLeft}
                                    label={
                                        !!viewData.yLeftAxisLabel
                                            ? {
                                                  value: viewData.yLeftAxisLabel,
                                                  angle: -90,
                                                  position: 'insideLeft'
                                              }
                                            : undefined
                                    }
                                />
                                <YAxis
                                    yAxisId='right'
                                    type='number'
                                    orientation='right'
                                    domain={viewData.domainRangeRight}
                                    tickFormatter={(v: number) => round0(v).toString()}
                                    label={
                                        !!viewData.yRightAxisLabel
                                            ? {
                                                  value: viewData.yRightAxisLabel,
                                                  angle: -90,
                                                  position: 'insideRight'
                                              }
                                            : undefined
                                    }
                                />
                                {renderTooltip(viewData)}
                                {renderLines(viewData.lines)}
                            </LineChart>
                        ) : null
                    }
                </AutoSizer>
            </Box>
            {viewType === GraphViewParam.Common ? (
                <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />
            ) : null}
            <div className={commonCss.results__legend}>{viewData?.legend.content()}</div>
        </>
    );
};

export const renderTooltip = (viewData: ChartViewData): JSX.Element => {
    if (!viewData.tooltip) {
        return null;
    }

    if (viewData.tooltip.renderFn) {
        return <Tooltip content={viewData.tooltip.renderFn()} />;
    }

    return <Tooltip content={<CustomTooltip />} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CustomTooltip extends React.PureComponent<any, null> {
    public render() {
        const { active, payload } = this.props;

        if (!active) {
            return null;
        }

        const isImpl = (dataKey: string) => test(/^value_/, dataKey);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((x: any) => (isImpl(x.dataKey) ? null : { key: x.dataKey, value: round(x.value, 2) })),
            reject(isNil)
        )(payload);

        const makeValueRow = val => (
            <div className={css.nsTooltip__row} key={val.key}>{`${val.key}: ${val.value}`}</div>
        );

        return <div className={css.nsTooltip}>{map(makeValueRow, data)}</div>;
    }
}
