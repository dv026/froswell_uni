import * as R from 'ramda';
import { filter, map, mapObjIndexed, reverse } from 'ramda';

import colors from '../../../../../theme/colors';
import { roundRect } from '../../../helpers/canvas';
import { opacity } from '../../../helpers/colors';
import { shallowEqual } from '../../../helpers/compare';
import { max } from '../../../helpers/math';
import { groupByProp, isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

const defaultFontSize = 2.5;
const defaultInflowHeight = 2.5;
const defaultOffsetX = 4;
const defaultOffsetY = 5;

interface WellCommentModel {
    wellId: number;
    x: number;
    y: number;
    comments: string[];
}

export class WellCommentsCanvasLayer extends CommonCanvas implements MapLayer {
    public data: WellCommentModel[];
    public visible: boolean;
    public canvasSize: CanvasSize;

    private names: {
        [index: string]: WellCommentModel[];
    };

    public constructor(data: WellCommentModel[], visible: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.data = data;
        this.visible = visible;
        this.canvasSize = canvasSize;
    }

    private zoomFactor = (k: number) => k * 0.5;

    public equals(other: WellCommentsCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.data, other.data) &&
            shallowEqual(this.visible, other.visible) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (): void => {
        if (!this.visible) {
            return;
        }

        const data = filter(it => !isNullOrEmpty(it.comments) && it.comments.length > 0, this.data) ?? [];

        if (isNullOrEmpty(data)) {
            return;
        }

        this.names = groupByProp(
            'wellId',
            R.map(
                it => ({
                    wellId: it.wellId,
                    x: this.cx(it.x),
                    y: this.cy(it.y),
                    comments: reverse(it.comments)
                }),
                data
            )
        );
    };

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.names || !this.visible) {
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

        mapObjIndexed(group => {
            if (isNullOrEmpty(group)) {
                return;
            }

            const [x, y] = model.transform.apply([group[0].x, group[0].y]);

            const plastNames = group[0].comments;

            const maxPlastWidth = max(map(it => model.context.measureText(it).width, plastNames)) * 1.1;

            roundRect(
                model.context,
                backColor,
                x + rectOffsetX - padding,
                y - rectOffsetY - padding - height * plastNames.length,
                maxPlastWidth + padding * 2,
                rectHeight * plastNames.length + padding * 2,
                zoom
            );

            let n = 1;

            for (const item of plastNames) {
                const name = item;

                model.context.save();
                model.context.beginPath();
                model.context.translate(x + offsetX + maxPlastWidth, y - offsetY - height * n);

                model.context.fillText(name, -maxPlastWidth, height / 4);

                model.context.closePath();
                model.context.restore();

                n++;
            }
        }, this.names);
    };
}
