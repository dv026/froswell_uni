import * as R from 'ramda';

import { DrilledWellPoint } from '../../../entities/wellPoint';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { InitMapModel, MapModel } from './../mapModel';
import { BaseWellsCanvasLayer, CanvasWellPoint } from './baseWellsCanvasLayer';
import { MapLayer } from './mapLayer';

export class DrilledFoundationCanvasLayer extends BaseWellsCanvasLayer implements MapLayer {
    private show: boolean;

    public wells: DrilledWellPoint[];
    public canvasSize: CanvasSize;

    public constructor(show: boolean, wells: DrilledWellPoint[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.show = show;

        this.wells = wells;
        this.canvasSize = canvasSize;
    }

    public equals(other: DrilledFoundationCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        if (!this.show) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.points = R.map((well: DrilledWellPoint): CanvasWellPoint => {
            const label = this.mapWellLabels(
                {
                    cx: this.cx(well.x),
                    cy: this.cy(well.y),
                    id: well.id,
                    title: well.name
                },
                false
            );

            return {
                x: this.cx(well.x),
                y: this.cy(well.y),
                id: well.id,
                title: label.title,
                bottom: label.bottom,
                showBottom: label.showBottom,
                horizontal: this.mapHorizontal(well.horizontal)
            };
        }, this.wells);
    };

    public render = (model: MapModel): void => {
        if (!this.show) {
            return;
        }

        if (model.isMinimap) {
            return;
        }

        this.renderDrilledWells(model);
    };
}
