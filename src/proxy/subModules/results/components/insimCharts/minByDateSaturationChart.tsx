import React from 'react';

import { any, curry, map, pipe, range } from 'ramda';
import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRecoilValue } from 'recoil';

import { SaturationTooltip } from '../../../../../common/components/charts/tooltips/saturationTooltip';
import { Rect } from '../../../../../common/entities/canvas/rect';
import { mmyyyy } from '../../../../../common/helpers/date';
import { nul } from '../../../../../common/helpers/ramda';
import { cls } from '../../../../../common/helpers/styles';
import { MinLDateSaturation } from '../../../../entities/frontTracking/frontTracking';
import { FrontTrackingBoundaries } from '../../../../entities/frontTracking/frontTrackingBoundaries';
import { valueProp } from '../../entities/chartBuilder';
import { frontTrackingBoundaries } from '../../store/frontTrackingBoundaries';
import { minByDate } from '../../store/minByDate';
import { area, labels, rectEquals } from './frontTrackingChart';
import { baseLine } from './helpers';

import commonCss from './../common.module.less';

export interface Props {
    neighborId: number;
    plastId: number;
}

export const MinByDateSaturationChart: React.FC<Props> = (p: Props) => {
    const data = useRecoilValue(minByDate({ neighborId: p.neighborId, plastId: p.plastId }));
    const boundaries = useRecoilValue(frontTrackingBoundaries(p.plastId));

    const [rect, setRect] = React.useState<Rect>(null);

    const updateRect = (p: CartesianGrid) => {
        const gridProps = p?.props;

        if (!p || !gridProps) {
            return;
        }

        const newRect = new Rect(gridProps.x, gridProps.y, gridProps.width, gridProps.height);
        if (!rectEquals(newRect, rect)) {
            setRect(new Rect(gridProps.x, gridProps.y, gridProps.width, gridProps.height));
        }
    };

    try {
        return (
            <>
                <div className={commonCss.results__chart}>
                    <ResponsiveContainer height='100%' width='100%'>
                        <ComposedChart
                            className={cls(['chart', 'chart_saturation'])}
                            data={map(makePayload(boundaries), data)}
                            margin={{ top: 30, right: 30, left: 30, bottom: 10 }}
                        >
                            <CartesianGrid
                                strokeDasharray='1 0'
                                vertical={false}
                                stroke='#A6A6A6'
                                ref={e => updateRect(e)}
                            />
                            <XAxis
                                dataKey='date'
                                type='number'
                                tickFormatter={date => mmyyyy(new Date(date))}
                                tickCount={10}
                                allowDataOverflow={true}
                                domain={['dataMin', 'dataMax']}
                            />
                            <YAxis
                                yAxisId='left'
                                type='number'
                                orientation='left'
                                domain={[0, 1]}
                                ticks={yAxisTicks()}
                                label={{
                                    value: 'FrontSaturation',
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <YAxis
                                yAxisId='right'
                                type='number'
                                orientation='right'
                                domain={[0, 1]}
                                ticks={yAxisTicks()}
                            />
                            {baseLine(valueProp('frontSaturation'), 'front')}

                            {baseLine(valueProp('residualOilSaturation'), 'residual')}
                            {baseLine(valueProp('initialWaterSaturation'), 'initial')}

                            {area('initialWaterSaturation', 'area_initial')}
                            {area('residualOilSaturation1', 'area_residual')}
                            {area('oil', 'area_oil')}
                            {area('water', 'area_water')}

                            {labels(rect)}

                            <Tooltip content={<SaturationTooltip dateLabel />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className={cls([commonCss.results__legend, commonCss.results__legend_saturation])}>
                    <div className={cls(['legend', 'legend_columned', 'legend_saturation'])}>
                        <div className='legend__column'>
                            <div className='legend__cell'>FrontSaturation:</div>
                            <div className='legend__cell'>
                                <div className={className('front', /*this.props.hiddenLines*/ [])} onClick={nul} />
                            </div>
                        </div>
                        <div className='legend__column'>
                            <div className='legend__cell'>Нефть:</div>
                            <div className='legend__cell'>
                                <div className={className('oil', /*this.props.hiddenLines*/ [])} onClick={nul} />
                            </div>
                        </div>
                        <div className='legend__column'>
                            <div className='legend__cell'>Вода:</div>
                            <div className='legend__cell'>
                                <div className={className('water', /*this.props.hiddenLines*/ [])} onClick={nul} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    } catch {
        return (
            <div className='error'>
                По какой-то причине данные для этой скважины отсутствуют, попробуйте выбрать другую скважину
            </div>
        );
    }
};

MinByDateSaturationChart.displayName = 'MinByDateSaturationChart';

const makePayload = curry((boundaries: FrontTrackingBoundaries, data: MinLDateSaturation) => {
    let payload = {
        date: data.date.getTime()
    };

    payload[valueProp('frontSaturation')] = data.saturation.frontSaturation;

    payload[valueProp('residualOilSaturation')] = boundaries.residualOilSaturation;
    payload[valueProp('initialWaterSaturation')] = boundaries.initialWaterSaturation;

    payload[valueProp('residualOilSaturation1')] = [boundaries.residualOilSaturation, 1];

    payload[valueProp('oil')] = [data.saturation.frontSaturation, boundaries.residualOilSaturation];
    payload[valueProp('water')] = [boundaries.initialWaterSaturation, data.saturation.frontSaturation];

    return payload;
});

const className = (propName: string, hiddenLines: string[]) =>
    cls([
        'legend__thumb',
        `legend__thumb_${propName}`,
        any(x => valueProp(propName) === x, hiddenLines) ? 'legend__thumb_inactive' : null
    ]);

const yAxisTicks = () =>
    pipe(
        () => range(1, 11),
        map(x => x / 10)
    )();
