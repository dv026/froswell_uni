import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { opacity } from 'common/helpers/colors';
import { isNullOrEmpty, shallow } from 'common/helpers/ramda';
import { scaleLinear } from 'd3-scale';
import { el } from 'date-fns/locale';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletPackerHistory } from 'input/entities/tabletModel';
import { PackerPumpType } from 'input/enums/packerPumpType';
import { filter, find, forEach, isNil, map, uniq } from 'ramda';

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

class Entry {
    public wellbore?: number[];
    public imgBlock?: number[];
    public img?: HTMLImageElement;
    public name?: string;
}

export class PackerPumpColumnTabletLayer extends BasePackerColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private item: Entry;

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: PackerPumpColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): PackerPumpColumnTabletLayer {
        return new PackerPumpColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        const defaultPackerWidth = 27;

        forEach(
            (it: TabletPackerHistory) => {
                if (!it.topPump) {
                    return null;
                }

                this.item = {};
                this.item.name = it.pumpName;

                this.item.img =
                    it.pumpType === PackerPumpType.ElectricSubmersiblePump ? model.images.imgESP : model.images.imgSPR;

                const topY = model.trajectoryScale.invert(it.topPump);

                let topPackerOffsetY = topY;

                // ствол скважины
                this.item = shallow(this.item, {
                    wellbore: [
                        model.cx(scope[0] + defaultPackerWidth),
                        model.cy(scope[1]),
                        model.cx(scope[2] - defaultPackerWidth),
                        model.cy(topPackerOffsetY)
                    ]
                });

                this.item = shallow(this.item, {
                    imgBlock: [
                        model.cx(scope[0] + defaultPackerWidth),
                        model.cy(topPackerOffsetY),
                        model.cx(scope[0] + defaultPackerWidth + this.item.img.width),
                        model.cy(topPackerOffsetY + this.item.img.height)
                    ]
                });
            },
            filter(it => it.id === model.settings.selectedPacker, model.model.packerHistory)
        );
    };

    public render = (model: TabletModel): void => {
        if (!this.item) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        this.renderWellbore(model, this.item.wellbore);
        this.renderImg(model, model.transform, this.item.imgBlock, this.item.img);

        const [x1, y1] = model.transform.apply([
            this.item.imgBlock[0] + (this.item.imgBlock[2] - this.item.imgBlock[0]) / 2,
            this.item.imgBlock[1] - FONT_SIZE
        ]);

        this.renderText(model, this.item.name, x1, y1, true, { align: 'center' });
    }
}
