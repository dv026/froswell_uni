import { isPointBetweenPoints } from 'common/helpers/geometry';
import * as d3 from 'd3';
import * as R from 'ramda';
import { any, concat, filter, find, findIndex, flatten, forEach, head, lastIndexOf, map, reduce } from 'ramda';
import { runInThisContext } from 'vm';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { distance } from '../../../helpers/math';
import { isNullOrEmpty, mapIndexed, shallow } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas, wellRadius } from '../../canvas/commonCanvas';
import { ContourModelBrief } from '../../contourModelBrief';
import { MapModel, InitMapModel } from '../mapModel';
import { contourStyle } from './contourCanvasLayer';
import { MapLayer } from './mapLayer';

const defaultSelectedStroke = colors.colors.blue;
const defaultStrokeWidth = 2;
const defaultRadius = 1;
const defaultBufferDistance = 25;

interface Entry {
    x: number;
    y: number;
}

interface StyleEntry {
    stroke: string;
    strokeWidth: number;
    dasharray: number[];
}

export class ContourDragChangingCanvasLayer extends CommonCanvas implements MapLayer {
    private show: boolean;
    private activeContourId: number;
    private contour: ContourModelBrief;
    private changeContour: (contour: ContourModelBrief) => void;

    private dragCursor: number[];

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private updateHandler: any;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private selection: any;

    private allowDrag: boolean;
    private points: Entry[];
    private styles: StyleEntry;

    public constructor(
        show: boolean,
        activeContourId: number,
        contour: ContourModelBrief,
        changeContour: (contour: ContourModelBrief) => void,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.show = show;
        this.activeContourId = activeContourId;
        this.contour = contour;
        this.changeContour = changeContour;

        this.allowDrag = true;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: ContourDragChangingCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.activeContourId, other.activeContourId) &&
            shallowEqual(this.contour, other.contour) &&
            shallowEqual(this.changeContour, other.changeContour) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model?: InitMapModel): void => {
        if (!this.show) {
            return;
        }

        if (!this.contour || isNullOrEmpty(this.contour.points)) {
            return;
        }

        this.dragCursor = [];

        this.updateHandler = model.update ?? this.updateHandler;
        this.selection = model.selection ?? this.selection;

        const drag = this.drag(this.selection);
        if (drag) {
            this.selection?.call(drag.on('start.render drag.render end.render', this.update));
        }

        model.initZoomBehavior();

        const contourType = find(x => x.key === this.contour.type, contourStyle);

        this.styles = {
            stroke: contourType.stroke,
            strokeWidth: contourType.strokeWidth,
            dasharray: contourType.strokeDasharray
        };

        this.points = mapIndexed(
            (it, index) => ({ x: this.cx(it[0]), y: this.cy(it[1]), id: index }),
            this.contour.points
        );
    };

    public onDoubleClick = (point: number[]) => {
        if (!this.show) {
            return;
        }

        if (isNullOrEmpty(this.points)) {
            return;
        }

        const indexOfBetweenPoints = (p: number[], points: Entry[]) => {
            return lastIndexOf(
                true,
                points.map(
                    (it, i) =>
                        !i ||
                        isPointBetweenPoints(
                            p,
                            this.invertPoint([it.x, it.y]),
                            this.invertPoint([points[i - 1].x, points[i - 1].y]),
                            defaultBufferDistance
                        )
                )
            );
        };

        const index = findIndex((it: Entry) => {
            const p = this.invertPoint([it.x, it.y]);
            return distance(point[0], point[1], p[0], p[1]) < defaultBufferDistance;
        })(this.points);

        if (index >= 0) {
            this.points.splice(index, 1);
            this.changeContour(
                shallow(this.contour, {
                    points: map(it => this.invertPoint([it.x, it.y]), this.points)
                })
            );
        } else {
            const index = indexOfBetweenPoints(point, this.points);
            if (index > 0) {
                this.points.splice(index, 0, { x: this.cx(point[0]), y: this.cy(point[1]) });
            }
        }
    };

    private update = () => {
        requestAnimationFrame(this.updateHandler);
    };

    public render = (model: MapModel): void => {
        if (!this.show) {
            return;
        }

        if (isNullOrEmpty(this.points)) {
            return;
        }

        const r = defaultRadius * this.zoomFactor(model.transform.k);

        model.context.save();
        model.context.beginPath();

        for (const d of this.points) {
            const [x, y] = model.transform.apply([d.x, d.y]);
            model.context.lineTo(x, y);
        }

        model.context.strokeStyle = this.styles.stroke;
        model.context.strokeWidth = this.styles.strokeWidth;
        model.context.setLineDash(this.styles.dasharray);
        model.context.stroke();

        for (const d of this.points) {
            const [x, y] = model.transform.apply([d.x, d.y]);
            model.context.beginPath();
            model.context.fillStyle = this.styles.stroke;
            model.context.arc(x, y, r, 0, Math.PI * 2, true);
            model.context.fill();
        }

        model.context.restore();
    };

    private drag = selection => {
        if (!this.allowDrag) {
            return null;
        }

        const dragsubject = () => {
            const transform = d3.zoomTransform(selection.node());

            let subject = null;
            let distance = wellRadius * this.zoomFactor(transform.k);
            for (const c of this.points) {
                let d = Math.hypot(transform.invertX(d3.event.x) - c.x, transform.invertY(d3.event.y) - c.y);
                if (d < distance) {
                    distance = d;
                    subject = c;
                }
            }

            if (subject) {
                subject.x = transform.applyX(subject.x);
                subject.y = transform.applyY(subject.y);
            }

            return subject;
        };

        const dragstarted = () => {
            const transform = d3.zoomTransform(selection.node());

            d3.event.subject.x = transform.invertX(d3.event.x);
            d3.event.subject.y = transform.invertY(d3.event.y);

            this.dragCursor = null;
        };

        const dragged = () => {
            const transform = d3.zoomTransform(selection.node());

            d3.event.subject.x = transform.invertX(d3.event.x);
            d3.event.subject.y = transform.invertY(d3.event.y);

            this.dragCursor = [this.invertX(d3.event.subject.x), this.invertY(d3.event.subject.y), d3.event.subject.id];
        };

        const dragended = () => {
            this.updatedWellPosition(this.dragCursor);

            this.dragCursor = null;
        };

        return d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    private updatedWellPosition(p: number[]) {
        if (isNullOrEmpty(p)) {
            return;
        }

        this.changeContour(
            shallow(this.contour, {
                points: map(it => this.invertPoint([it.x, it.y]), this.points)
            })
        );
    }
}
