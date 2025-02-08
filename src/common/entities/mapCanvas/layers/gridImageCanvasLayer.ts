// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { isNil } from 'ramda';

import { GridMapEnum } from '../../../enums/gridMapEnum';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

//const defaultOffset = 0.5;
//const defaultGridSize = 1;

export class GridImageCanvasLayer extends CommonCanvas implements MapLayer {
    public image: HTMLImageElement;
    public data: number[][];
    public active: any;
    public canvasSize: CanvasSize;

    private hiddenCanvas: any;

    private colors: tinycolor.Instance[];
    private minValue: number;
    private maxValue: number;

    public constructor(
        image: HTMLImageElement,
        data: number[][],
        active: GridMapEnum,
        stepSize: number,
        canvasSize: CanvasSize
    ) {
        super(canvasSize);

        this.image = image;
        this.data = data;
        this.active = active;
        this.canvasSize = new CanvasSize(canvasSize.xMin, canvasSize.yMin, canvasSize.xMax, canvasSize.yMax, stepSize);
    }

    public equals(other: GridImageCanvasLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.image, other.image) &&
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.active, other.active) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    private zoomFactor = (k: number) => k;

    public initLayer = (): void => {
        if (isNil(this.image) || this.active === GridMapEnum.None) {
            return;
        }

        this.hiddenCanvas = d3.select('#hiddenCanvas');

        if (this.hiddenCanvas && this.hiddenCanvas.node()) {
            const ctx = this.hiddenCanvas.node().getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, this.gridWidth(), this.gridHeight());

            ctx.drawImage(this.image, 0, 0, this.gridWidth(), this.gridHeight());
        }
    };

    public render = (model: MapModel): void => {
        if (isNil(this.image) || this.active === GridMapEnum.None) {
            return;
        }

        if (this.hiddenCanvas && this.hiddenCanvas.node()) {
            const [x, y] = model.transform.apply([
                this.cx(this.canvasSize.xMin - this.canvasSize.size / 2),
                this.cy(this.canvasSize.yMax)
            ]);

            const [x2, y2] = model.transform.apply([
                this.cx(this.canvasSize.xMax - this.canvasSize.size / 2),
                this.cy(this.canvasSize.yMin)
            ]);

            model.context.drawImage(
                this.hiddenCanvas.node(),
                0,
                0,
                this.gridWidth(),
                this.gridHeight(),
                x,
                y,
                Math.abs(x2 - x),
                Math.abs(y2 - y)
            );
        }
    };
}
