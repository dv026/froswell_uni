import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { Tablet } from 'input/components/tablet';
import { TabletColumn } from 'input/entities/tabletColumn';
import { clone, filter, includes, map, sum } from 'ramda';

import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvasTablet } from '../commonCanvasTablet';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BaseColumnTabletLayer } from './baseColumnTabletLayer';
import { DEFAULT_LOGGING_HEIGHT, DEFAULT_LOGGING_PADDING } from './headerLoggingTabletLayer';

const DEFAULT_WELL_BLOCK_HEIGHT = 40;
const DEFAULT_HEADER_HEIGHT = 190;
export const DEFAULT_TiCK_SIZE = 6;

export class HeaderBaseTabletLayer extends BaseColumnTabletLayer {
    public canvasSize: CanvasSize;

    public transform: any;

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    protected getHeaderHeight = (model: InitTabletModel) =>
        Math.max(
            DEFAULT_HEADER_HEIGHT,
            model.settings.selectedLogging.length * (DEFAULT_LOGGING_HEIGHT + DEFAULT_LOGGING_PADDING) +
                DEFAULT_WELL_BLOCK_HEIGHT
        );

    protected getFullHeaderHeight = (model: InitTabletModel) => DEFAULT_WELL_BLOCK_HEIGHT + this.getHeaderHeight(model);

    protected customTransform(model: TabletModel) {
        this.transform = clone(model.transform);

        if (this.transform.y < 0) {
            this.transform.y = 0;
        }
    }

    protected getAdaptationScope = (columns: TabletColumn[]) => {
        const width = sum(
            map(
                (x: TabletColumn) => x.width,
                filter(it => it.isProxy, columns)
            )
        );

        if (!width) {
            return [];
        }

        const startX = sum(
            map(
                (x: TabletColumn) => x.width,
                filter(it => it.index < TabletColumnEnum.ProxyAvgVolume, columns)
            )
        );

        return [startX, startX + width];
    };

    protected getEfficiencyScope = (columns: TabletColumn[]) => {
        const width = sum(
            map(
                (x: TabletColumn) => x.width,
                filter(it => it.isEfficiency, columns)
            )
        );

        if (!width) {
            return [];
        }

        const startX = sum(
            map(
                (x: TabletColumn) => x.width,
                filter(it => it.index < TabletColumnEnum.EfficiencyAcidInjectionVolume, columns)
            )
        );

        return [startX, startX + width];
    };
}
