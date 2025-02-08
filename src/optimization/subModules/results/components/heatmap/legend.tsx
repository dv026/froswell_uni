import React from 'react';

import * as d3 from 'd3';
import { isNil } from 'ramda';

import { interpolateTurboColors, LegendControl, legendWidth } from '../../entities/legendControl';

const width = legendWidth;
const height = 50;

const color = (min: number, max: number) =>
    d3.scaleSequentialSqrt([min, max], d3.interpolateRgbBasis(interpolateTurboColors));

export interface LegendProps {
    min: number;
    max: number;
    title: string;
}

export const Legend: React.FC<LegendProps> = (p: LegendProps) => {
    const [legend] = React.useState(new LegendControl());
    const el = React.useRef(null);

    React.useEffect(() => {
        if (isNil(p) || isNil(p.max) || p.min === p.max) {
            return;
        }

        legend.init(el.current, color(p.min, p.max), p.title);
        // TODO: проверить правильность задания зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.min, p.max]);

    return <svg ref={el} width={width} height={height}></svg>;
};
