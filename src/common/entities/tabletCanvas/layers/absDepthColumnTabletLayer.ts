import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { always, cond, equals, includes, isNil, T } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { getAbsDepth } from '../helpers/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_DEPTH_STEP = 2;

const getDepthStep = (scale: number) => {
    const standard = 10000;

    return cond([
        [equals(standard / 1), always(0.02)],
        [equals(standard / 5), always(0.1)],
        [equals(standard / 10), always(0.2)],
        [equals(standard / 50), always(1)],
        [equals(standard / 75), always(1.5)],
        [equals(standard / 100), always(DEFAULT_DEPTH_STEP)],
        [equals(standard / 125), always(DEFAULT_DEPTH_STEP * 1.25)],
        [equals(standard / 150), always(DEFAULT_DEPTH_STEP * 1.5)],
        [equals(standard / 175), always(DEFAULT_DEPTH_STEP * 1.75)],
        [equals(standard / 200), always(DEFAULT_DEPTH_STEP * 2.0)],
        [equals(standard / 250), always(DEFAULT_DEPTH_STEP * 2.5)],
        [equals(standard / 400), always(DEFAULT_DEPTH_STEP * 4)],
        [equals(standard / 500), always(DEFAULT_DEPTH_STEP * 5)],
        [equals(standard / 1000), always(DEFAULT_DEPTH_STEP * 10)],
        [T, always(DEFAULT_DEPTH_STEP)]
    ])(scale);
};

class Entry {
    public abs: string;
    public real: string;
    public line: number[];
}

export class AbsDepthColumnTabletLayer extends BaseColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;

    private items: Entry[];

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: AbsDepthColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): AbsDepthColumnTabletLayer {
        return new AbsDepthColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.items = [];

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        for (
            let i = Math.floor(model.absTop + 5);
            i < Math.ceil(model.absBottom);
            i += getDepthStep(model.settings.scale)
        ) {
            const y = model.scaleY(i);
            this.items.push({
                real: Math.round(model.trajectoryScale(i)).toString(),
                abs: (-Math.round(i)).toString(),
                line: [model.cx(scope[0]), model.cy(y), model.cx(scope[2]), model.cy(y)]
            });
        }
    };

    public render = (model: TabletModel): void => {
        if (isNullOrEmpty(this.items)) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        for (const d of this.items) {
            const [x1, y1] = model.transform.apply([
                d.line[0] + (d.line[2] - d.line[0]) / 2,
                d.line[1] + (d.line[3] - d.line[1]) / 2
            ]);

            this.renderText(model, d.real, x1, y1 - this.zoomTextSmallSize(model.transform.k), true, {
                fontsize: this.zoomTextSize(model.transform.k),
                align: 'center'
            });
            this.renderText(model, d.abs, x1, y1 + this.zoomTextSmallSize(model.transform.k), true, {
                fontsize: this.zoomTextSmallSize(model.transform.k),
                align: 'center'
            });

            this.renderLine(model, d.line);
        }
    }

    private renderLine(model: TabletModel, line: number[]) {
        const [x1, y1] = model.transform.apply([line[0], line[1]]);
        const [x2, y2] = model.transform.apply([line[2], line[3]]);

        model.context.beginPath();

        model.context.moveTo(x1, y1);
        model.context.lineTo(x2, y2);

        model.context.lineWidth = this.zoomLineSize(model.transform.k);
        model.context.strokeStyle = colors.control.grey400;

        model.context.stroke();
    }
}
