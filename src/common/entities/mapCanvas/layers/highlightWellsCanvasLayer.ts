import { isNil, map } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { WellPoint } from '../../wellPoint';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultRadius = 2.5;

export class HighlightWellsCanvasLayer extends CommonCanvas implements MapLayer {
    public wells: WellPoint[];
    public visible: boolean;
    public canvasSize: CanvasSize;

    private points: number[][];

    public constructor(wells: WellPoint[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.wells = wells;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 1;

    public equals(other: HighlightWellsCanvasLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.wells, other.wells) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (): void => {
        if (!this.visible) {
            return;
        }

        this.points = map(it => [this.cx(it.x), this.cy(it.y)], this.wells || []);
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (isNullOrEmpty(this.points)) {
            return;
        }

        const r = defaultRadius * this.zoomFactor(model.transform.k);

        model.context.save();

        for (const d of this.points) {
            const [x, y] = model.transform.apply(d);
            model.context.fillStyle = colors.map.selected;
            model.context.beginPath();
            model.context.arc(x, y, r, 0, Math.PI * 2, true);
            model.context.closePath();
            model.context.fill();
        }

        model.context.restore();
    };
}
