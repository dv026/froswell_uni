import * as R from 'ramda';
import { map } from 'ramda';

import colors from '../../../../../theme/colors';
import { CanvasSize } from '../../../../common/entities/canvas/canvasSize';
import { CommonCanvas } from '../../../../common/entities/canvas/commonCanvas';
import { MapLayer } from '../../../../common/entities/mapCanvas/layers/mapLayer';
import { PlastNamesCanvasLayer } from '../../../../common/entities/mapCanvas/layers/plastNamesCanvasLayer';
import { InitMapModel, MapModel } from '../../../../common/entities/mapCanvas/mapModel';
import { roundRect } from '../../../../common/helpers/canvas';
import { opacity } from '../../../../common/helpers/colors';
import { shallowEqual } from '../../../../common/helpers/compare';
import { max, round0, round2 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { AdaptationWellPropertyRaw } from '../../../subModules/editModel/entities/adaptationWellPropertyRaw';

const defaultFontSize = 4.5;
const defaultInflowHeight = 4.5;
const defaultOffsetX = 4;
const defaultOffsetY = 5;

interface PropertyModel {
    wellId: number;
    x: number;
    y: number;
    items: string[][];
}

export class WellPropertiesCanvasLayer extends CommonCanvas implements MapLayer {
    public data: AdaptationWellPropertyRaw[];
    public visible: boolean;
    public canvasSize: CanvasSize;

    private properties: PropertyModel[];

    public constructor(data: AdaptationWellPropertyRaw[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.data = data;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.5 * this.canvasScale;

    public equals(other: PlastNamesCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model?: InitMapModel): void => {
        if (!this.visible) {
            return;
        }

        if (isNullOrEmpty(this.data)) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.properties = map(
            it => ({
                wellId: it.wellId,
                x: this.cx(it.xWell),
                y: this.cy(it.yWell),
                items: [
                    it.oilError ? [`${round0(it.oilError)}% MAPE`, colors.colors.red] : null,
                    it.prevolumeMultiplier && it.prevolumeMultiplier !== 1
                        ? [`V x ${round2(it.prevolumeMultiplier)}`, colors.bg.black]
                        : null,
                    it.transmissibilityMultiplier && it.transmissibilityMultiplier !== 1
                        ? [`T x ${round2(it.transmissibilityMultiplier)}`, colors.bg.black]
                        : null
                ]
                    .filter(Boolean)
                    .reverse()
            }),
            this.data
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.properties || !this.visible) {
            return;
        }

        if (model.transform.k < 3) {
            return;
        }

        const zoom = this.zoomFactor(model.transform.k);

        const fontSize = defaultFontSize * zoom;
        const height = defaultInflowHeight * zoom;
        const offsetX = defaultOffsetX * zoom;
        const offsetY = defaultOffsetY * zoom;

        const rectOffsetX = 5 * zoom;
        const rectOffsetY = 7 * zoom;
        const rectHeight = fontSize;

        const padding = zoom * 2;

        const backColor = opacity(colors.bg.selected, 0.5);

        model.context.fillStyle = 'black';
        model.context.font = `${fontSize}px Inter`;
        model.context.textAlign = 'left';

        map(it => {
            if (isNullOrEmpty(it.items)) {
                return;
            }

            if (isNullOrEmpty(it.items[0])) {
                return;
            }

            const items = it.items;

            const [x, y] = model.transform.apply([it.x, it.y]);

            const maxPlastWidth = model.context.measureText(items[0][0]).width * 1.1;

            roundRect(
                model.context,
                backColor,
                x + rectOffsetX - padding,
                y - rectOffsetY - padding - height * items.length,
                maxPlastWidth + padding * 2,
                rectHeight * items.length + padding * 2,
                zoom
            );

            let n = 1;

            for (const item of items) {
                const [name, color] = item;

                model.context.save();
                model.context.beginPath();
                model.context.translate(x + offsetX + maxPlastWidth, y - offsetY - height * n);

                model.context.fillStyle = color;
                model.context.fillText(name, -maxPlastWidth, height / 4);

                model.context.closePath();
                model.context.restore();

                n++;
            }
        }, this.properties);
    };
}
