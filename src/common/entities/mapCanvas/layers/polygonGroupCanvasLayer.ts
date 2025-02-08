import * as R from 'ramda';
import { forEach } from 'ramda';

import colors from '../../../../../theme/colors';
import {
    anyGroup,
    calcGroup,
    calcGroupExists,
    calcGroups,
    ordinalGroup,
    ordinalGroupExists,
    WellGroup
} from '../../../../proxy/entities/proxyMap/wellGroup';
import { opacity } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { nul } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const colorRed = colors.typo.placeholder;
const colorRedAlfa = opacity(colors.typo.placeholder, 0.1);

const colorBlue = 'rgba(37, 170, 225, 1)'; // todo mb
const colorBlueAlfa = 'rgba(37, 170, 225, 0.1)'; // todo mb

const colorBlack = 'rgba(0, 0, 0, 0)'; // todo mb
const colorBlackAlfa = 'rgba(70, 70, 70, 0.1)'; // todo mb

export class PolygonGroupCanvasLayer extends CommonCanvas implements MapLayer {
    public canvasSize: CanvasSize;
    public groups: WellGroup[];

    public constructor(canvasSize: CanvasSize, groups: WellGroup[]) {
        super(canvasSize);

        this.canvasSize = canvasSize;
        this.groups = groups;
    }

    public equals(other: PolygonGroupCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize) && shallowEqual(this.groups, other.groups);
    }

    public initLayer = nul;

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (R.isNil(this.groups)) {
            return;
        }

        if (!anyGroup(this.groups)) {
            return;
        }

        if (calcGroupExists(this.groups) && ordinalGroupExists(this.groups)) {
            let diff = this.polygonClip(calcGroup(this.groups).polygon, ordinalGroup(this.groups).polygon);
            this.renderPolygon(model, diff, colorBlack, colorBlackAlfa);
        }

        if (calcGroupExists(this.groups)) {
            forEach(it => this.renderPolygon(model, it.polygon, colorRed, colorRedAlfa), calcGroups(this.groups));
        }

        if (ordinalGroupExists(this.groups)) {
            forEach(it => this.renderPolygon(model, it.polygon, colorBlue, colorBlueAlfa), calcGroups(this.groups));
        }
    };

    private renderPolygon(model: MapModel, poly, color, fillColor) {
        if (R.isNil(poly)) {
            return;
        }

        if (R.isEmpty(poly)) {
            return;
        }

        const polygon = R.map(it => [this.cx(it[0]), this.cy(it[1])], poly);
        const lastPoint = model.transform.apply(polygon[polygon.length - 1]);

        model.context.beginPath();
        model.context.moveTo(lastPoint[0], lastPoint[1]);

        for (const d of polygon) {
            const [x, y] = model.transform.apply(d);
            model.context.lineTo(x, y);
        }

        model.context.closePath();

        model.context.fillStyle = fillColor;
        model.context.fill();

        model.context.lineWidth = 1;
        model.context.strokeStyle = color;
        model.context.stroke();

        for (const d of polygon) {
            const [x, y] = model.transform.apply(d);

            model.context.beginPath();
            model.context.arc(x, y, 1, 0, 2 * Math.PI);
            model.context.closePath();
            model.context.fillStyle = fillColor;
            model.context.fill();
            model.context.lineWidth = 1;
            model.context.strokeStyle = color;
            model.context.stroke();
        }
    }

    private getBottomPoint(polygon) {
        let minY = 0;
        let point = polygon[0];
        let priv = polygon[polygon.length - 1];
        for (const d of polygon) {
            const [x, y] = d;

            if (y > minY) {
                minY = y;
                point = [x, y];
            }

            priv = d;
        }

        return [point, priv];
    }

    private polygonClip(clip, subject) {
        const closed = this.polygonClosed(subject);
        const n = clip.length - Number(this.polygonClosed(clip));
        subject = subject.slice(); // copy before mutate
        for (let i = 0, a = clip[n - 1], b, c, d; i < n; ++i) {
            const input = subject.slice();
            const m = input.length - Number(closed);
            subject.length = 0;
            b = clip[i];
            c = input[m - 1];
            for (let j = 0; j < m; ++j) {
                d = input[j];
                if (this.lineOrient(d, a, b)) {
                    if (!this.lineOrient(c, a, b)) {
                        subject.push(this.lineIntersect(c, d, a, b));
                    }

                    subject.push(d);
                } else if (this.lineOrient(c, a, b)) {
                    subject.push(this.lineIntersect(c, d, a, b));
                }

                c = d;
            }

            if (closed) subject.push(subject[0]);
            a = b;
        }

        return subject.length ? subject : null;
    }

    private lineOrient([px, py], [ax, ay], [bx, by]) {
        return (bx - ax) * (py - ay) < (by - ay) * (px - ax);
    }

    private lineIntersect([ax, ay], [bx, by], [cx, cy], [dx, dy]) {
        const bax = bx - ax,
            bay = by - ay,
            dcx = dx - cx,
            dcy = dy - cy;
        const k = (bax * (cy - ay) - bay * (cx - ax)) / (bay * dcx - bax * dcy);
        return [cx + k * dcx, cy + k * dcy];
    }

    private polygonClosed(points) {
        const [ax, ay] = points[0],
            [bx, by] = points[points.length - 1];
        return ax === bx && ay === by;
    }

    private polygonConvex(points) {
        const n = points.length;
        const [rx, ry] = points[n - 2];
        let [qx, qy] = points[n - 1];
        let vx = rx - qx,
            vy = ry - qy;
        for (let i = 0; i < n; ++i) {
            const [px, py] = points[i];
            const wx = qx - px,
                wy = qy - py;
            if (wx * vy < wy * vx) return false;
            if (wx || wy) (vx = wx), (vy = wy);
            (qx = px), (qy = py);
        }

        return true;
    }
}
