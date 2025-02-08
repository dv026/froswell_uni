import { Point } from '../../entities/canvas/point';

export interface WellProps {
    cx: number;
    cy: number;
    id: number;
    title: string;
    changeWell?: (id: number) => void;
}

export interface HorizontalWellProps {
    horizontal?: ReadonlyArray<Point>;
}

export interface EdgeShift {
    across: number;
    along: number;
}
