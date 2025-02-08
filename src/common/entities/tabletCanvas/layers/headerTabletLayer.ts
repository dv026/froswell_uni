import { WellTypeEnum } from 'common/enums/wellTypeEnum';
import { drawMultiline } from 'common/helpers/canvas';
import { max, round1 } from 'common/helpers/math';
import { tryParse } from 'common/helpers/number';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import i18n from 'i18next';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletEfficiencyModel } from 'input/entities/tabletDataModel';
import { WellLoggingEnum } from 'input/enums/wellLoggingEnum';
import { always, cond, equals, forEach, forEachObjIndexed, head, isNil, map, mean, reject, sum, T } from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { CanvasSize } from '../../canvas/canvasSize';
import { efficiencyColumns } from '../helpers/constants';
import { TabletLayer } from '../tabletLayer';
import { InitTabletModel, TabletModel } from '../tabletModel';
import { FONT_SIZE } from './baseTabletLayer';
import { DEFAULT_TiCK_SIZE, HeaderBaseTabletLayer } from './headerBaseTabletLayer';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const getWellTypeUrl = (type: WellTypeEnum) => {
    return cond([
        [equals(WellTypeEnum.Oil), always('/images/well/drop.svg')],
        [equals(WellTypeEnum.Injection), always('/images/well/down.svg')],
        [equals(WellTypeEnum.Mixed), always('/images/well/drop_and_down.svg')],
        [equals(WellTypeEnum.Unknown), always('/images/well/drop_time.svg')],
        [T, always('')]
    ])(type);
};

const DEFAULT_COLOR = colors.bg.brand;
const DEFAULT_WELL_BLOCK_HEIGHT = 40;

class EntryEfficiencyGtm {
    public group: number[];
    public label: string;
}

class EntryLogging {
    public group: number[];
    public type: WellLoggingEnum;
    public name: string;
    public unit: string;
    public color: string;
    public scale: EntryScale;
    public imgPlusBlock: number[];
    public imgMinusBlock: number[];
}

class EntryScale {
    public points: number[][];
    public rect?: number[];
}

class EntryColumns {
    public label: string;
    public rect: number[];
    public background: string;
    public horizontal: boolean;
    public scale: EntryScale;
    public isEfficiency: boolean;
}

class EntryHeader {
    public wellName: string;
    public wellTypeImg: any;
    public wellRect: number[];
    public columns: EntryColumns[];
    public adaprationGroup: number[];
    public efficiencyGtmGroup: EntryEfficiencyGtm[];
    public efficiencyGroup: number[];
    public logging: EntryLogging[];
}

export class HeaderTabletLayer extends HeaderBaseTabletLayer implements TabletLayer {
    public canvasSize: CanvasSize;

    private header: EntryHeader;

    public constructor(canvasSize: CanvasSize) {
        super(canvasSize);

        this.canvasSize = canvasSize;
    }

    public zoomFactor = (k: number): number => k * 0.9;

    public equals(other: HeaderTabletLayer): boolean {
        if (isNil(other)) {
            return false;
        }

        return shallowEqual(this.canvasSize, other.canvasSize);
    }

    private getScale = (model: InitTabletModel, column: TabletColumn, currentX: number): EntryScale => {
        if (!column || !column.range || !column.rangeStep) {
            return null;
        }

        const height = 5;
        const x = this.rangeScaleLinear(column.index, model.columns);
        const tickFormat = x.tickFormat();

        return {
            points: x
                .ticks(column.rangeStep)
                .map(d => [
                    model.cx(currentX + x(d)),
                    model.cy(this.getFullHeaderHeight(model) - height),
                    tryParse(tickFormat(d))
                ])
        };
    };

    public clone(): HeaderTabletLayer {
        return new HeaderTabletLayer(this.canvasSize);
    }

    public initLayer = (model: InitTabletModel): void => {
        this.header = new EntryHeader();
        this.header.columns = [];

        let currentX = model.canvasSize.xMin;

        forEach(it => {
            if (it.width) {
                let currentY = DEFAULT_WELL_BLOCK_HEIGHT;

                if (it.isProxy) {
                    currentY = DEFAULT_WELL_BLOCK_HEIGHT * 2;
                }

                if (it.isEfficiency) {
                    currentY = DEFAULT_WELL_BLOCK_HEIGHT * 2;
                }

                this.header.columns.push({
                    label: it.label,
                    rect: [
                        model.cx(currentX),
                        model.cy(currentY),
                        model.cx(currentX + it.width),
                        model.cy(this.getFullHeaderHeight(model))
                    ],
                    background: it.background,
                    horizontal: it.horizontal,
                    scale: this.getScale(model, it, currentX),
                    isEfficiency: it.isEfficiency
                });
                currentX += it.width;
            }
        }, model.columns);

        this.header.wellName = isNullOrEmpty(model.model.data) ? '' : head(model.model.data).wellName;

        this.header.wellRect = [
            model.cx(model.canvasSize.xMin),
            model.cy(model.canvasSize.yMin),
            model.cx(currentX),
            model.cy(DEFAULT_WELL_BLOCK_HEIGHT)
        ];

        const adaptationScope = this.getAdaptationScope(model.columns);

        if (!isNullOrEmpty(adaptationScope)) {
            this.header.adaprationGroup = [
                model.cx(adaptationScope[0]),
                model.cy(DEFAULT_WELL_BLOCK_HEIGHT),
                model.cx(adaptationScope[1]),
                model.cy(DEFAULT_WELL_BLOCK_HEIGHT * 2)
            ];
        }

        const efficiencyScope = this.getEfficiencyScope(model.columns);

        if (!isNullOrEmpty(efficiencyScope)) {
            this.header.efficiencyGroup = [
                model.cx(efficiencyScope[0]),
                model.cy(DEFAULT_WELL_BLOCK_HEIGHT),
                model.cx(efficiencyScope[1]),
                model.cy(DEFAULT_WELL_BLOCK_HEIGHT * 2)
            ];

            this.header.efficiencyGtmGroup = [];

            let w = efficiencyScope[0];

            // todo mb
            const type = EvaluationTypeEnum.Standart;

            forEachObjIndexed((group: TabletEfficiencyModel[], key: string) => {
                const columns = reject((c: TabletColumn) => !max(map(it => it[c.dataKey], group)), efficiencyColumns);

                const efficiencyColumnWidth = sum(columns.map(it => it.width));

                if (efficiencyColumnWidth > 0) {
                    this.header.efficiencyGtmGroup.push({
                        group: [
                            model.cx(w),
                            model.cy(DEFAULT_WELL_BLOCK_HEIGHT * 2),
                            model.cx(w + efficiencyColumnWidth),
                            model.cy(this.getFullHeaderHeight(model) - DEFAULT_WELL_BLOCK_HEIGHT)
                        ],
                        label: `${key.trim().split('  ').join('\n')}\n+${round1(
                            (type === EvaluationTypeEnum.Standart
                                ? mean(map(it => it.effectiveOilMonth, group))
                                : sum(map(it => it.effectiveOilMonth, group))) / 1000
                        )} ${i18n.t(dict.common.units.tonsAccumulated)}`
                    });

                    w += efficiencyColumnWidth;
                }
            }, groupByProp('operationName', model.model.efficiencyData ?? []));
        }

        if (model.well.charWorkId) {
            this.header.wellTypeImg = model.images.well[model.well.charWorkId];
        }
    };

    public render = (model: TabletModel): void => {
        if (!this.header || isNullOrEmpty(this.header.columns)) {
            return;
        }

        this.customTransform(model);

        this.renderWell(model);
        this.renderColumns(model);
        this.renderAdaptationGroup(model);
        this.renderEfficiencyGtm(model);
        this.renderEfficiencyGroup(model);
    };

    private renderWell(model: TabletModel) {
        // background
        this.renderRect(model, this.header.wellRect, this.transform, colors.bg.grey200, colors.bg.grey200);

        // wellName
        const [x1, y1] = this.transform.apply([
            this.header.wellRect[0] + (this.header.wellRect[2] - this.header.wellRect[0]) / 2,
            this.header.wellRect[1] + (this.header.wellRect[3] - this.header.wellRect[1]) / 2
        ]);

        this.renderCustomText(model, this.header.wellName, x1, y1, true, {
            fontsize: this.zoomTextTitleSize(this.transform.k)
        });

        this.renderWellImg(model, x1, y1, this.header.wellName);
    }

    private renderWellImg(model: TabletModel, x: number, y: number, name: string) {
        if (!this.header.wellTypeImg) {
            return;
        }

        const zoom = this.zoomTextTitleSize(model.transform.k);
        const width = model.context.measureText(name).width * zoom * 0.15;

        model.context.save();
        model.context.translate(x - width / 2, y - zoom / 2);

        model.context.drawImage(this.header.wellTypeImg, 0, 0, zoom, zoom);

        model.context.restore();
    }

    private renderColumns(model: TabletModel) {
        for (const d of this.header.columns) {
            this.renderRect(model, d.rect, this.transform, d.background ?? colors.colors.white, DEFAULT_COLOR);

            const x = d.horizontal ? d.rect[0] + FONT_SIZE / 2 : (d.rect[0] + d.rect[2]) / 2;
            let y = d.horizontal ? d.rect[1] : (d.rect[1] + d.rect[3]) / 2;

            let fontsize = this.zoomTextSize(this.transform.k);

            if (d.isEfficiency) {
                y = d.rect[3] - DEFAULT_WELL_BLOCK_HEIGHT;
                fontsize = this.zoomTextTinySize(this.transform.k);
            }

            // column name
            const [x1, y1] = this.transform.apply([x, y]);

            this.renderCustomText(model, d.label, x1, y1 + this.zoomTextSize(this.transform.k), d.horizontal, {
                fontsize: fontsize
            });

            this.renderScale(model, d.scale);
        }
    }

    private renderScale = (model: TabletModel, scale: EntryScale) => {
        if (!scale) {
            return;
        }

        scale.points.forEach(d => {
            const [x1, y1] = this.transform.apply([d[0], d[1]]);
            const [x2, y2] = this.transform.apply([d[0], d[1] + DEFAULT_TiCK_SIZE]);

            model.context.beginPath();

            model.context.moveTo(x1, y1);
            model.context.lineTo(x2, y2);

            model.context.strokeStyle = colors.control.grey400;
            model.context.stroke();

            if (d[2]) {
                drawMultiline(
                    model.context,
                    d[2].toString(),
                    x1,
                    y1 - this.zoomTextTinySize(this.transform.k) / 2,
                    true,
                    {
                        fontsize: this.zoomTextTinySize(this.transform.k),
                        align: 'center',
                        color: colors.typo.secondary
                    }
                );
            }
        });
    };

    private renderAdaptationGroup(model: TabletModel) {
        if (isNullOrEmpty(this.header.adaprationGroup)) {
            return;
        }

        // background
        this.renderRect(model, this.header.adaprationGroup, this.transform, colors.bg.white, DEFAULT_COLOR);

        // wellName
        const [x1, y1] = this.transform.apply([
            this.header.adaprationGroup[0] + (this.header.adaprationGroup[2] - this.header.adaprationGroup[0]) / 2,
            this.header.adaprationGroup[1] + (this.header.adaprationGroup[3] - this.header.adaprationGroup[1]) / 2
        ]);

        this.renderCustomText(model, i18n.t(dict.proxy.adaptation), x1, y1, true, {
            fontsize: this.zoomTextSize(this.transform.k),
            align: 'center'
        });
    }

    private renderEfficiencyGtm(model: TabletModel) {
        if (isNullOrEmpty(this.header.efficiencyGtmGroup)) {
            return;
        }

        for (const d of this.header.efficiencyGtmGroup) {
            // background
            this.renderRect(model, d.group, this.transform, colors.bg.white, DEFAULT_COLOR);

            // wellName
            const [x1, y1] = this.transform.apply([
                d.group[0] + (d.group[2] - d.group[0]) / 2,
                d.group[1] + (d.group[3] - d.group[1]) / 2
            ]);

            this.renderCustomText(model, d.label, x1 - this.zoomTextSize(this.transform.k), y1, false, {
                fontsize: this.zoomTextSize(this.transform.k),
                align: 'center'
            });
        }
    }

    private renderEfficiencyGroup(model: TabletModel) {
        if (isNullOrEmpty(this.header.efficiencyGroup)) {
            return;
        }

        // background
        this.renderRect(model, this.header.efficiencyGroup, this.transform, colors.bg.white, DEFAULT_COLOR);

        // wellName
        const [x1, y1] = this.transform.apply([
            this.header.efficiencyGroup[0] + (this.header.efficiencyGroup[2] - this.header.efficiencyGroup[0]) / 2,
            this.header.efficiencyGroup[1] + (this.header.efficiencyGroup[3] - this.header.efficiencyGroup[1]) / 2
        ]);

        this.renderCustomText(model, i18n.t(dict.load.repairs), x1, y1, true, {
            fontsize: this.zoomTextSize(this.transform.k),
            align: 'center'
        });
    }
}
