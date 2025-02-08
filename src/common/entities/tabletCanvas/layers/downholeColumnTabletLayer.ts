import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { roundRect } from 'common/helpers/canvas';
import { opacity } from 'common/helpers/colors';
import { ddmmyyyy } from 'common/helpers/date';
import { isNullOrEmpty, shallow } from 'common/helpers/ramda';
import { scaleLinear } from 'd3-scale';
import { el } from 'date-fns/locale';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletDownholeHistory, TabletPackerHistory } from 'input/entities/tabletModel';
import { getDownholeBriefLabel } from 'input/enums/downholeType';
import { PackerPumpType } from 'input/enums/packerPumpType';
import { filter, find, forEach, isEmpty, isNil, map, uniq } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { saturationColor } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';
import { BasePackerColumnTabletLayer } from './basePackerColumnTabletLayer';
import { FONT_SIZE } from './baseTabletLayer';

const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_BACK_COLOR = opacity(colors.bg.black, 0.1);
const DEFAULT_LINE_WEIGHT = 2;

class Entry {
    public rect?: number[];
    public labelRect?: number[];
    public text?: string;
}

export class DownholeColumnTabletLayer extends BasePackerColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private item: Entry;

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: DownholeColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): DownholeColumnTabletLayer {
        return new DownholeColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.item = {};

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        const defaultLabelWidth = 10;
        const defaultLabelHeight = 45;

        forEach(
            (it: TabletDownholeHistory) => {
                const topY = model.trajectoryScale.invert(it.depth);

                let topPackerOffsetY = model.scaleY(topY);

                this.item.rect = [
                    model.cx(scope[0]),
                    model.cy(topPackerOffsetY - DEFAULT_LINE_WEIGHT),
                    model.cx(scope[2]),
                    model.cy(topPackerOffsetY + DEFAULT_LINE_WEIGHT)
                ];

                this.item.labelRect = [
                    model.cx(scope[0] + defaultLabelWidth),
                    model.cy(topPackerOffsetY + DEFAULT_LINE_WEIGHT),
                    model.cx(scope[2] - defaultLabelWidth),
                    model.cy(topPackerOffsetY + DEFAULT_LINE_WEIGHT + defaultLabelHeight)
                ];

                this.item.text = `${getDownholeBriefLabel(it.downholeType)}\n${ddmmyyyy(new Date(it.dt))}`;
            },
            filter(it => it.id === model.settings.selectedDownhole, model.model.downholeHistory || [])
        );
    };

    public render = (model: TabletModel): void => {
        if (isEmpty(this.item)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        this.renderRect(model, this.item.rect, model.transform, colors.bg.black, colors.bg.black);
        this.renderLabel(model, this.item.labelRect, this.item.text);
    }

    private renderLabel(model: TabletModel, rectangle: number[], text: string) {
        const rect = this.rectangle(rectangle, model.transform);

        const zoom = this.zoomTextSize(model.transform.k);

        model.context.save();
        model.context.beginPath();
        model.context.translate(rect[0], rect[1]);

        roundRect(model.context, DEFAULT_BACK_COLOR, 0, 0, rect[2], rect[3], zoom / 4);

        model.context.closePath();
        model.context.restore();

        this.renderText(model, text, rect[0] + rect[2] / 2, rect[1] + zoom, true, {
            align: 'center',
            color: colors.typo.primary
        });
    }
}
