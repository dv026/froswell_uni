import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isNullOrEmpty, shallow } from 'common/helpers/ramda';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletPackerHistory } from 'input/entities/tabletModel';
import { filter, forEach, isNil } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { BasePackerColumnTabletLayer } from './basePackerColumnTabletLayer';

const DEFAULT_COLOR = colors.bg.black;
const DEFAULT_DIVIDED_WELLBORE_COLOR = '#BBBBBB';
const PACKER_COLOR = '#2C8F36';
const IMAGE_RATIO = 1;

class EntryPacker {
    public topPacker1?: number[];
    public topPacker2?: number[];
    public bottomPacker1?: number[];
    public bottomPacker2?: number[];
}

class EntryFilter {
    public betweenDividedEquipment?: number[];
    public betweenNonDividedEquipment?: number[];
    public topFilter?: number[];
    public bottomFilter?: number[];
    public dividedEquipment?: number[];
}

class Entry {
    public wellbore: number[];
    public dividedEquipmentWellbore?: number[];
    public behindPipeInjection?: number[];
    public packers: EntryPacker;
    public filters: EntryFilter;
}

export class PackerHistoryColumnTabletLayer extends BasePackerColumnTabletLayer implements TabletLayer {
    public column: TabletColumnEnum;
    public canvasSize: CanvasSize;

    private item: Entry;
    private imgFilter?: HTMLImageElement;
    private imgFilterTiny?: HTMLImageElement;
    private imgFilterBackground?: HTMLImageElement;
    private imgPipeInjection?: HTMLImageElement;
    private imgBehindPipeInjection?: HTMLImageElement;

    public constructor(column: TabletColumnEnum, canvasSize: CanvasSize) {
        super(canvasSize);

        this.column = column;
        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: PackerHistoryColumnTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.column, other.column) && shallowEqual(this.canvasSize, other.canvasSize);
    }

    public clone(): PackerHistoryColumnTabletLayer {
        return new PackerHistoryColumnTabletLayer(this.column, this.canvasSize);
    }

    public initLayer = (model?: InitTabletModel): void => {
        this.item = {
            wellbore: [],
            packers: {},
            filters: {}
        };

        if (this.isHidden(this.column, model.settings.hiddenColumns)) {
            return;
        }

        const scope = this.columnScope(this.column, model.columns, model.canvasSize);

        const defaultPackerWidth = 27;
        const defaultWellboreWidth = 54;
        const defaultPackerNonHermeticWidth = 20;
        const defaultPackerDividedWidth = 36.5;
        const defaultPackerHeight = 24;
        const defaultPackerFilterWidth = 83;
        const defaultPackerFilterHeight = 115;
        const defaultPackerMargin = 150;
        const defaultTabletMargin = 100;

        forEach(
            (it: TabletPackerHistory) => {
                if (!it.topPacker && !it.bottomPacker) {
                    return null;
                }

                const topY = model.trajectoryScale.invert(it.topPacker);
                const bottomY = model.trajectoryScale.invert(it.bottomPacker);

                let packerY = scope[1];
                let packerHeight = model.scaleY(scope[1] + bottomY) + defaultPackerHeight;

                let topPackerOffsetY = model.scaleY(topY);
                let bottomPackerOffsetY = model.scaleY(bottomY);

                if (it.topPacker && it.bottomPacker) {
                    if (!it.filterBetweenPackers) {
                        packerHeight += defaultPackerFilterHeight;
                    }

                    if (it.autonomousPipeLayout) {
                        packerY = model.scaleY(topY) - defaultPackerFilterHeight;
                        packerHeight =
                            bottomPackerOffsetY -
                            topPackerOffsetY +
                            defaultPackerHeight +
                            defaultPackerFilterHeight * 2;
                    }
                }

                if (it.topPacker && !it.bottomPacker) {
                    packerHeight = model.scaleY(scope[1] + topY) + defaultPackerHeight + defaultPackerFilterHeight;
                    topPackerOffsetY = model.scaleY(topY);
                }

                if (!it.topPacker && it.bottomPacker) {
                    bottomPackerOffsetY = model.scaleY(bottomY);
                }

                // ствол скважины
                this.item = shallow(this.item, {
                    wellbore: [
                        model.cx(scope[0] + defaultPackerWidth),
                        model.cy(packerY),
                        model.cx(scope[2] - defaultPackerWidth),
                        model.cy(packerY + packerHeight)
                    ]
                });

                // top packer
                this.item.packers = shallow(this.item.packers, {
                    topPacker1: [
                        model.cx(scope[0]),
                        model.cy(topPackerOffsetY),
                        model.cx(scope[0] + (it.hermeticState ? defaultPackerWidth : defaultPackerNonHermeticWidth)),
                        model.cy(topPackerOffsetY + defaultPackerHeight)
                    ],
                    topPacker2: [
                        model.cx(scope[2] - (it.hermeticState ? defaultPackerWidth : defaultPackerNonHermeticWidth)),
                        model.cy(topPackerOffsetY),
                        model.cx(scope[2]),
                        model.cy(topPackerOffsetY + defaultPackerHeight)
                    ]
                });

                // bottom packer
                this.item.packers = shallow(this.item.packers, {
                    bottomPacker1: [
                        model.cx(scope[0]),
                        model.cy(bottomPackerOffsetY),
                        model.cx(scope[0] + (it.hermeticState ? defaultPackerWidth : defaultPackerNonHermeticWidth)),
                        model.cy(bottomPackerOffsetY + defaultPackerHeight)
                    ],
                    bottomPacker2: [
                        model.cx(scope[2] - (it.hermeticState ? defaultPackerWidth : defaultPackerNonHermeticWidth)),
                        model.cy(bottomPackerOffsetY),
                        model.cx(scope[2]),
                        model.cy(bottomPackerOffsetY + defaultPackerHeight)
                    ]
                });

                // filter
                if (it.filterBetweenPackers) {
                    if (it.dividedEquipment) {
                        this.item.filters = shallow(this.item.filters, {
                            betweenDividedEquipment: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(topPackerOffsetY + defaultPackerHeight),
                                model.cx(scope[2] - defaultPackerWidth),
                                model.cy(bottomPackerOffsetY)
                            ]
                        });
                    } else {
                        this.item.filters = shallow(this.item.filters, {
                            betweenNonDividedEquipment: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(topPackerOffsetY + defaultPackerHeight),
                                model.cx(scope[0] + defaultPackerFilterWidth),
                                model.cy(bottomPackerOffsetY)
                            ]
                        });
                    }
                } else {
                    if (it.topPacker && it.bottomPacker) {
                        this.item.filters = shallow(this.item.filters, {
                            topFilter: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(topPackerOffsetY - defaultPackerFilterHeight),
                                model.cx(scope[0] + defaultPackerFilterWidth),
                                model.cy(topPackerOffsetY)
                            ]
                        });
                        this.item.filters = shallow(this.item.filters, {
                            bottomFilter: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(bottomPackerOffsetY + defaultPackerHeight),
                                model.cx(scope[0] + defaultPackerFilterWidth),
                                model.cy(bottomPackerOffsetY + defaultPackerFilterHeight + defaultPackerHeight)
                            ]
                        });
                    }

                    if (it.topPacker && !it.bottomPacker) {
                        this.item.filters = shallow(this.item.filters, {
                            topFilter: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(topPackerOffsetY + defaultPackerHeight),
                                model.cx(scope[0] + defaultPackerFilterWidth),
                                model.cy(topPackerOffsetY + defaultPackerFilterHeight)
                            ]
                        });
                    }

                    if (!it.topPacker && it.bottomPacker) {
                        this.item.filters = shallow(this.item.filters, {
                            bottomFilter: [
                                model.cx(scope[0] + defaultPackerWidth),
                                model.cy(bottomPackerOffsetY - defaultPackerFilterHeight),
                                model.cx(scope[0] + defaultPackerFilterWidth),
                                model.cy(bottomPackerOffsetY)
                            ]
                        });
                    }
                }

                if (it.dividedEquipment) {
                    this.item = shallow(this.item, {
                        dividedEquipmentWellbore: [
                            model.cx(scope[0] + defaultPackerDividedWidth),
                            model.cy(packerY),
                            model.cx(scope[0] + defaultPackerDividedWidth * 2),
                            model.cy(packerY + packerHeight + defaultPackerFilterHeight)
                        ]
                    });
                    this.item.filters = shallow(this.item.filters, {
                        dividedEquipment: [
                            model.cx(scope[0] + defaultPackerWidth),
                            model.cy(bottomPackerOffsetY + defaultPackerHeight),
                            model.cx(scope[0] + defaultPackerFilterWidth),
                            model.cy(bottomPackerOffsetY + defaultPackerFilterHeight)
                        ]
                    });
                }

                if (it.behindPipeInjection) {
                    this.item = shallow(this.item, {
                        behindPipeInjection: [
                            model.cx(scope[0] + 5),
                            model.cy(Math.max(topPackerOffsetY, bottomPackerOffsetY) - defaultPackerHeight - 40),
                            model.cx(scope[0] + 40),
                            model.cy(Math.max(topPackerOffsetY, bottomPackerOffsetY) - defaultPackerHeight)
                        ]
                    });
                }
            },
            filter(it => it.id === model.settings.selectedPacker, model.model.packerHistory)
        );

        this.imgFilter = model.images.imgFilter;
        this.imgFilterTiny = model.images.imgFilterTiny;
        this.imgPipeInjection = model.images.imgPipeInjection;
        this.imgFilterBackground = model.images.imgFilterBackground;
        this.imgBehindPipeInjection = model.images.imgBehindPipeInjection;
    };

    public render = (model: TabletModel): void => {
        if (!this.item) {
            return;
        }

        this.renderItems(model);
    };

    private renderItems(model: TabletModel) {
        if (isNullOrEmpty(this.item.dividedEquipmentWellbore)) {
            this.renderWellbore(model, this.item.wellbore);
        } else {
            this.renderDividedEquipmentWellbore(model, this.item.wellbore);
            this.renderBackgroundFilter(model, this.item.filters.betweenDividedEquipment, this.imgFilterTiny, 2.5);
            this.renderWellbore(model, this.item.dividedEquipmentWellbore);
        }

        this.renderBehindPipeInjection(model, this.item.behindPipeInjection);
        this.renderPackers(model, this.item.packers);
        this.renderFilters(model, this.item.filters);
    }

    private renderPackers(model: TabletModel, d: EntryPacker) {
        this.renderPacker(model, d.topPacker1);
        this.renderPacker(model, d.topPacker2);
        this.renderPacker(model, d.bottomPacker1);
        this.renderPacker(model, d.bottomPacker2);
    }

    private renderPacker(model: TabletModel, rectangle: number[]) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        const rect = this.rectangle(rectangle, model.transform);

        model.context.save();

        model.context.fillStyle = PACKER_COLOR;
        model.context.fillRect(...rect);

        model.context.restore();

        [rectangle, [rectangle[2], rectangle[1], rectangle[0], rectangle[3]]].forEach(p => {
            const [x1, y1] = model.transform.apply([p[0], p[1]]);
            const [x2, y2] = model.transform.apply([p[2], p[3]]);

            model.context.save();
            model.context.beginPath();

            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);

            model.context.lineWidth = this.zoomLineSize(model.transform.k);
            model.context.strokeStyle = colors.colors.white;

            model.context.stroke();
            model.context.restore();
        });
    }

    private renderFilters(model: TabletModel, d: EntryFilter) {
        //this.renderFilter(model, d.betweenDividedEquipment);

        this.renderBackgroundFilter(model, d.betweenNonDividedEquipment, this.imgFilterBackground, 16, true);
        this.renderFilter(model, d.topFilter, this.imgFilter);
        this.renderFilter(model, d.bottomFilter, this.imgFilter);
        this.renderFilter(model, d.dividedEquipment, this.imgFilter);
        //this.renderFilter(model, d.betweenDividedEquipment, this.imgFilter, true);
    }

    private renderFilter(
        model: TabletModel,
        rectangle: number[],
        img: HTMLImageElement = null,
        debug: boolean = false
    ) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        if (debug) {
            this.renderRect(model, rectangle, model.transform, 'red', 'red');
        }

        const rect = [rectangle[0] + 12, rectangle[1] + 12, rectangle[2], rectangle[3]];

        this.renderImg(model, model.transform, rect, img);
    }

    private renderBackgroundFilter(
        model: TabletModel,
        rectangle: number[],
        img: HTMLImageElement = null,
        marginLeft: number,
        repeatY: boolean = false,
        debug: boolean = false
    ) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        if (debug) {
            this.renderRect(model, rectangle, model.transform, 'red', 'red');
        }

        const rect = [rectangle[0] + marginLeft, rectangle[1], rectangle[2], rectangle[3]];

        this.renderBackgroundImage(model, rect, img, repeatY);
    }

    private renderBackgroundImage(
        model: TabletModel,
        rectangle: number[],
        img: HTMLImageElement = null,
        repeatY: boolean = false
    ) {
        const rect = this.rectangle(rectangle, model.transform);

        const pattern = model.context.createPattern(img, repeatY ? 'repeat-y' : 'repeat');

        model.context.save();
        model.context.translate(rect[0], rect[1]);

        model.context.scale(model.transform.k / IMAGE_RATIO, model.transform.k / IMAGE_RATIO);

        model.context.fillStyle = pattern;
        model.context.fillRect(
            0,
            0,
            (rect[2] / model.transform.k) * IMAGE_RATIO,
            (rect[3] / model.transform.k) * IMAGE_RATIO
        );

        model.context.restore();
    }

    protected renderDividedEquipmentWellbore(model: TabletModel, rectangle: number[]) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        this.renderRect(
            model,
            rectangle,
            model.transform,
            DEFAULT_DIVIDED_WELLBORE_COLOR,
            DEFAULT_DIVIDED_WELLBORE_COLOR
        );
    }

    protected renderBehindPipeInjection(model: TabletModel, rectangle: number[]) {
        if (isNullOrEmpty(rectangle)) {
            return;
        }

        const rect = [rectangle[0] + 0.35, rectangle[1] + 0.5, rectangle[2], rectangle[3]];

        this.renderImg(model, model.transform, rect, this.imgBehindPipeInjection);
    }
}
