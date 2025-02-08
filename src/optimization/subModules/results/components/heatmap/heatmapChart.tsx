import React from 'react';

import { isNil } from 'ramda';

import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { Heatmap } from '../../entities/heatmap';
import { HeatmapModel } from './comparisonChart';

import css from './index.module.less';

const width = 700;

export interface HeatmapChartProps {
    data: HeatmapModel;
    title: string;
    isOil: boolean;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = (p: HeatmapChartProps) => {
    const [chart] = React.useState(new Heatmap(width, p.data));
    const el = React.useRef(null);

    React.useEffect(() => {
        if (isNil(p.data) || isNullOrEmpty(p.data.names) || isNullOrEmpty(p.data.values)) {
            return;
        }

        chart.init(el.current, p.data, p.isOil);
        // TODO: проверить правильность задания зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.data]);

    return (
        <div className={css.comparison__legendItem}>
            <svg ref={el} width={width}></svg>
        </div>
    );
};
