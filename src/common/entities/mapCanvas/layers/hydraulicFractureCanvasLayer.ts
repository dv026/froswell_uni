import * as R from 'ramda';

import { WellPointDonut } from '../../../entities/wellPoint';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from './../mapModel';
import { MapLayer } from './mapLayer';

const defaultOffsetX = 1.5;
const defaultOffsetY = 6;

export class HydraulicFractureCanvasLayer extends CommonCanvas implements MapLayer {
    public wells: WellPointDonut[];
    public canvasSize: CanvasSize;

    private grp1: number[][];
    private grp2: number[][];

    public constructor(wells: WellPointDonut[], canvasSize: CanvasSize) {
        super(canvasSize);

        this.wells = wells;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.75 * this.canvasScale;

    public equals(other: HydraulicFractureCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return shallowEqual(this.wells, other.wells) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public initLayer = (model: InitMapModel): void => {
        this.setCanvasScale(model?.scale);

        this.grp1 = R.map(
            (it: WellPointDonut) => [this.cx(it.x), this.cy(it.y)],
            R.filter(it => it.grpState === 1, this.wells)
        );

        this.grp2 = R.map(
            (it: WellPointDonut) => [this.cx(it.x), this.cy(it.y)],
            R.filter(it => it.grpState === 2, this.wells)
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.grp1) && isNullOrEmpty(this.grp1)) {
            return;
        }

        const offsetX = defaultOffsetX * this.zoomFactor(model.transform.k);
        const offsetY = defaultOffsetY * this.zoomFactor(model.transform.k);

        model.context.beginPath();

        model.context.lineWidth = 1;
        model.context.strokeStyle = 'red';

        for (const d of this.grp1) {
            const [x, y] = model.transform.apply(d);
            model.context.moveTo(x - offsetX, y - offsetY);
            model.context.lineTo(x + offsetX, y + offsetY);
        }

        model.context.closePath();
        model.context.stroke();

        model.context.beginPath();

        for (const d of this.grp2) {
            const [x, y] = model.transform.apply(d);
            model.context.moveTo(x - offsetX, y - offsetY);
            model.context.lineTo(x + offsetX, y + offsetY);
            model.context.moveTo(x - offsetY, y);
            model.context.lineTo(x + offsetY, y);
        }

        model.context.closePath();
        model.context.stroke();
    };
}
