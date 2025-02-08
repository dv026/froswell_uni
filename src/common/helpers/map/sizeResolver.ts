import * as R from 'ramda';

import { Line } from '../../entities/canvas/line';
import { Point } from '../../entities/canvas/point';
import { Rect } from '../../entities/canvas/rect';

export const viewBoxHeight = (width: number, height: number, baseWidth: number): number =>
    Math.floor((height * baseWidth) / width);

export const center = (
    width: number,
    height: number,
    shiftWidth: number = 0,
    shiftHeight: number = 0
): [number, number] => [shiftWidth + R.divide(width, 2), shiftHeight + R.divide(height, 2)];

const shift = x => (x === false ? R.add : R.subtract);
export const pos = (raw: number, centerRaw: number, center: number, rate: number, revert: boolean = false): number =>
    Math.round(shift(revert)(center, R.multiply(R.subtract(raw, centerRaw), rate)));

const letter = R.ifElse(
    R.isEmpty,
    () => 'M',
    () => 'L'
);
const addPoint = (segment: string, p: Point): string =>
    `${segment} ${letter(segment)}${Math.round(p.x)},${Math.round(p.y)}`;
export const path = (points: Array<Point> | ReadonlyArray<Point>): string => R.reduce(addPoint, '', points);
export const pathСlosed = (points: Array<Point> | ReadonlyArray<Point>): string => `${path(points)}Z`;

const addRect = (segment: string, p: Rect): string =>
    `${segment}M${Math.round(p.x)},${Math.round(p.y)}h${Math.round(p.height)}v${Math.round(p.width)}h-${Math.round(
        p.height
    )}z`;
export const rectsToPath = (lines: Array<Rect> | ReadonlyArray<Rect>): string => R.reduce(addRect, '', lines);

const addLine = (segment: string, p: Line): string => `${segment}M${p.x1} ${p.y1} L${p.x2} ${p.y2}z`;
export const linesToPath = (lines: Array<Line> | ReadonlyArray<Line>): string => R.reduce(addLine, '', lines);
