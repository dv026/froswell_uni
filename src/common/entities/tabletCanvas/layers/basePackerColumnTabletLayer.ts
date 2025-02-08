import { isNullOrEmpty } from 'common/helpers/ramda';

import { CanvasSize } from '../../canvas/canvasSize';
import { TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

export class BasePackerColumnTabletLayer extends BaseColumnTabletLayer {
    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);
    }

    protected renderWellbore(model: TabletModel, rectangle: number[]) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        const rect = this.rectangle(rectangle, model.transform);

        const gradient = model.context.createLinearGradient(0, 0, rect[2], 0);

        // Add three color stops
        gradient.addColorStop(0, '#DCDCDC');
        gradient.addColorStop(0.25, '#F7F7F7');
        gradient.addColorStop(0.5, '#F7F7F7');
        gradient.addColorStop(0.75, '#F7F7F7');
        gradient.addColorStop(1, '#DCDCDC');

        model.context.save();
        model.context.translate(rect[0], rect[1]);

        model.context.fillStyle = gradient;
        model.context.fillRect(0, 0, rect[2], rect[3]);

        model.context.restore();
    }
}
