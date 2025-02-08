import React, { PureComponent, RefObject } from 'react';

import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';
import i18n from 'i18next';
import { append, concat, filter, find, head, includes, isNil, map, split } from 'ramda';
import { TOOL_AUTO, TOOL_NONE, ToolbarPosition, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import ReactTooltip from 'react-tooltip';
import { AutoSizer } from 'react-virtualized';
import * as SvgAsPng from 'save-svg-as-png';

import { MinusIcon, PlusIcon } from '../../../common/components/customIcon/general';
import { ExportIcon, ExportXSLSIcon } from '../../../common/components/customIcon/map';
import { ToolsGroup } from '../../../common/components/tools/toolsGroup';
import { Point } from '../../../common/entities/canvas/point';
import { WellBrief } from '../../../common/entities/wellBrief';
import { KeyCodeEnum } from '../../../common/enums/keyCodesEnum';
import { ddmmyyyy } from '../../../common/helpers/date';
import { distance, max, min, round1 } from '../../../common/helpers/math';
import { isFn, isNullOrEmpty, mapIndexed, removeNulls } from '../../../common/helpers/ramda';
import { cls, px } from '../../../common/helpers/styles';
import { LoggingSettingModel } from '../../entities/loggingSettingModel';
import { ProxyTabletModel, TabletEfficiencyModel } from '../../entities/tabletDataModel';
import {
    TabletDownholeHistory,
    TabletLogging,
    TabletModel,
    TabletPackerHistory,
    TabletPerforation,
    TabletResearchInflowProfile,
    TabletTrajectory
} from '../../entities/tabletModel';
import { WellLoggingEnum } from '../../enums/wellLoggingEnum';
import {
    columnWidth as ColumnGeneralElementWidth,
    TabletGeneralElementProps,
    TabletGeneralElement,
    getLoggingChart,
    getColumns,
    efficiencyColumnWidth
} from '../tabletGeneralElement';
import {
    columnWidth as ColumnProfileElementWidth,
    columnStratigraphyWidth,
    TabletProfileElementProps,
    TabletProfileElement
} from '../tabletProfileElement';

import css from './index.module.less';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const defaultHeaderHeight = 500;
export const defaultTabletStep = 2;
export const defaultTabletMargin = 100;

export interface TabletProps {
    data: TabletModel[];
    efficiencyData?: TabletEfficiencyModel[];
    efficiencyEvaluationType?: EvaluationTypeEnum;
    fixedHeader: boolean;
    focusOnProductionObject: number;
    height?: number;
    loggingSettings: LoggingSettingModel[];
    packerHistory: TabletPackerHistory[];
    downholeHistory: TabletDownholeHistory[];
    perforation: TabletPerforation[];
    profileMode: boolean;
    proxyData?: ProxyTabletModel[];
    researchInflowProfile: TabletResearchInflowProfile[];
    scale: number;
    selectedLogging: WellLoggingEnum[];
    selectedResearch: Date[];
    selectedWells: WellBrief[];
    showDepth: boolean;
    trajectories: TabletTrajectory[];
    well: WellBrief;
    wellName: string;
    wellLogging: TabletLogging[];
    width?: number;
    exportData?: () => void;
}

interface TabletState {
    zoom: number;
    headerOffset: number;
    xOffset: number;
    selectedObject: number;
    selectedWell: WellBrief;
    pressCtrl: boolean;
    polygon: Array<Point>;
    cursorPoint: Point;
}

class TabletComponent extends PureComponent<TabletProps, TabletState> {
    private divElement: RefObject<HTMLDivElement>;
    private exportElement: RefObject<HTMLDivElement>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private Viewer: any;

    private canvasWidth: number;
    private canvasHeight: number;

    private canvasAllWidth: number;

    private cursorPointX: number;
    private cursorPointY: number;

    private minAbsDepth: number;
    private maxAbsDepth: number;

    private minRealDepth: number;
    private maxRealDepth: number;

    private isFirstVisit: boolean;

    private minimapDrag: boolean;

    private onClickByMinimapHandler;
    private onMouseDownByMinimapHandler;
    private onMouseUpByMinimapHandler;

    private onKeyDownHandler;
    private onKeyUpHandler;

    public constructor(props, state) {
        super(props, state);

        this.Viewer = null;

        this.canvasWidth = 0;
        this.canvasHeight = 0;

        this.canvasAllWidth = 0;

        this.cursorPointX = 0;
        this.cursorPointY = 0;

        this.isFirstVisit = true;

        this.minimapDrag = false;

        this.state = {
            zoom: 0.5644739300537778,
            headerOffset: 0,
            xOffset: 0,
            selectedObject: null,
            selectedWell: null,
            pressCtrl: false,
            polygon: [],
            cursorPoint: null
        };

        this.divElement = React.createRef();
        this.exportElement = React.createRef();

        this.onClickByMinimapHandler = this.onClickByMinimap.bind(this);
        this.onMouseDownByMinimapHandler = this.onMouseDownByMinimap.bind(this);
        this.onMouseUpByMinimapHandler = this.onMouseUpByMinimap.bind(this);

        this.onKeyDownHandler = this.keyDownFunction.bind(this);
        this.onKeyUpHandler = this.keyUpFunction.bind(this);
    }

    private minimapElement = () => this.divElement.current.children[0].children[2];

    public componentDidMount() {
        if (isNil(this.Viewer)) {
            return;
        }

        this.focusOnObject();

        document.addEventListener('keydown', this.onKeyDownHandler, false);
        document.addEventListener('keyup', this.onKeyUpHandler, false);

        this.minimapElement()?.addEventListener('mousemove', this.onClickByMinimapHandler);
        this.minimapElement()?.addEventListener('mousedown', this.onMouseDownByMinimapHandler);
        this.minimapElement()?.addEventListener('mouseup', this.onMouseUpByMinimapHandler);
        this.minimapElement()?.addEventListener('click', this.onClickByMinimapHandler);
    }

    public componentDidUpdate() {
        ReactTooltip.rebuild();

        if (this.Viewer) {
            this.focusOnObject();
        }
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDownHandler, false);
        document.removeEventListener('keyup', this.onKeyUpHandler, false);

        this.minimapElement()?.removeEventListener('mousemove', this.onClickByMinimapHandler);
        this.minimapElement()?.removeEventListener('mousedown', this.onMouseDownByMinimapHandler);
        this.minimapElement()?.removeEventListener('mouseup', this.onMouseUpByMinimapHandler);
        this.minimapElement()?.removeEventListener('click', this.onClickByMinimapHandler);
    }

    private keyDownFunction(event) {
        if (event.keyCode === KeyCodeEnum.ESCAPE) {
            this.clearPolygon();
        } else if (event.keyCode === KeyCodeEnum.CTRL) {
            if (this.state.pressCtrl !== true) {
                this.setState({ pressCtrl: true });
            }
        }
    }

    private keyUpFunction(event) {
        if (event.keyCode === KeyCodeEnum.CTRL) {
            if (this.state.pressCtrl !== false) {
                this.setState({ pressCtrl: false });
            }
        }
    }

    public render() {
        if (!this.props.well) return null;

        return (
            <div className={css.tablet}>
                <div
                    ref={this.divElement}
                    className={css.tablet__wrapper}
                    style={{ width: px(this.props.width), height: px(this.props.height) }}
                >
                    {this.renderTable('main_svg', this.props.width, this.props.height)}
                    <div className={css.tablet__toolsContainer}>{this.renderZoomPanel()}</div>
                </div>
                <div style={{ display: 'none' }} ref={this.exportElement}>
                    <svg
                        key='svg_tablet_export'
                        width={this.canvasAllWidth}
                        height={this.canvasHeight}
                        fontFamily='Inter'
                        viewBox={`0 0 ${this.canvasAllWidth} ${this.canvasHeight}`}
                        version='1.1'
                        xmlns='http://www.w3.org/2000/svg'
                        xmlnsXlink='http://www.w3.org/1999/xlink'
                    >
                        <rect fill='#fff' x='0' y='0' width={this.canvasAllWidth} height={this.canvasHeight} />
                        <g id='export_g' key='export' transform={`matrix(1,0,0,1,0,0)`}></g>
                    </svg>
                </div>
                <ReactTooltip
                    id='tablet-tooltip'
                    disable={!this.props.showDepth || this.state.pressCtrl || !isNullOrEmpty(this.state.polygon)}
                    data-html={true}
                    effect='float'
                    getContent={e => this.tooltipContent(e)}
                />
            </div>
        );
    }

    private focusOnObject() {
        if (
            (this.Viewer && this.state.selectedObject !== this.props.focusOnProductionObject) ||
            this.state.selectedWell !== this.props.well
        ) {
            const currentObject = find(
                it => it.productionObjectId === this.props.focusOnProductionObject,
                this.props.data
            );
            if (currentObject) {
                setTimeout(() => {
                    const heightOffset = this.heightOffset(currentObject.topAbs);
                    this.Viewer.setPointOnViewerCenter(this.canvasWidth / 2, heightOffset, this.state.zoom);
                    this.setState({
                        selectedObject: this.props.focusOnProductionObject,
                        selectedWell: this.props.well,
                        headerOffset: this.Viewer.state.value.f,
                        xOffset: this.Viewer.state.value.e
                    });
                }, 1);
            }
        }
    }

    private trajectoryScale = scaleLinear()
        .domain(map(it => it.zAbs, this.props.trajectories))
        .range(map(it => it.z, this.props.trajectories));

    private currentAbsDepth = value =>
        this.minAbsDepth + ((value - defaultHeaderHeight - defaultTabletMargin) / this.props.scale) * defaultTabletStep;

    private currentRealDepth = value => this.trajectoryScale(value);

    private absDataDepth = () =>
        concat(
            map(it => it.topAbs, this.props.data),
            map(it => it.bottomAbs, this.props.data)
        );
    private absPerforationDepth = () =>
        concat(
            map(it => it.topAbs, this.props.perforation),
            map(it => it.bottomAbs, this.props.perforation)
        );
    private absPackerHistory = () =>
        concat(
            concat(
                map(
                    it => this.trajectoryScale.invert(it),
                    removeNulls(map(x => x.topPacker, this.props.packerHistory ?? []))
                ),
                map(
                    it => this.trajectoryScale.invert(it),
                    removeNulls(map(x => x.bottomPacker, this.props.packerHistory ?? []))
                )
            ),
            map(it => this.trajectoryScale.invert(it), removeNulls(map(x => x.topPump, this.props.packerHistory ?? [])))
        );

    private absDownholeDepth = () =>
        map(it => this.trajectoryScale.invert(it), removeNulls(map(x => x.depth, this.props.downholeHistory ?? [])));

    private absDepth = () =>
        concat(
            concat(concat(this.absDataDepth(), this.absPerforationDepth()), this.absPackerHistory()),
            this.absDownholeDepth()
        );

    private realDataDepth = () =>
        concat(
            map(it => it.top, this.props.data),
            map(it => it.bottom, this.props.data)
        );
    private realPerforationDepth = () =>
        concat(
            map(it => it.top, this.props.perforation),
            map(it => it.bottom, this.props.perforation)
        );
    private realPackerHistory = () =>
        removeNulls(
            concat(
                concat(
                    map(it => it.topPacker, this.props.packerHistory ?? []),
                    map(it => it.bottomPacker, this.props.packerHistory ?? [])
                ),
                map(it => it.topPump, this.props.packerHistory ?? [])
            )
        );

    private realDepth = () =>
        concat(concat(this.realDataDepth(), this.realPerforationDepth()), this.realPackerHistory());

    private bodyHeight = () =>
        ((this.maxAbsDepth - this.minAbsDepth) * this.props.scale) / defaultTabletStep + defaultTabletMargin * 2;
    private heightOffset = absDepth => {
        let value =
            (this.bodyHeight() * (absDepth - this.minAbsDepth)) / (this.maxAbsDepth - this.minAbsDepth) +
            defaultHeaderHeight +
            (this.props.focusOnProductionObject ? defaultTabletMargin : defaultHeaderHeight - 75);
        value = value ? value : 0;

        if (value + this.Viewer.state.value.f < 0) {
            value = value + this.Viewer.props.height / 2 - defaultHeaderHeight;
        } else if (value >= 0 && value <= 1000) {
            value = value + this.Viewer.state.value.f + 225;
        }

        return value;
    };

    private tooltipContent(dataTip) {
        const absDepth = round1(this.currentAbsDepth(this.cursorPointY));
        const realDepth = round1(this.currentRealDepth(this.currentAbsDepth(this.cursorPointY)));

        const data = dataTip ? map(it => <p key={it}>{it}</p>, split('|', dataTip)) : null;

        return (
            <>
                <p>
                    H(md/abs): {absDepth}/{realDepth}
                </p>
                {data}
            </>
        );
    }

    private renderTableElement() {
        let offsetX = 0;

        const wells =
            this.props.selectedWells && this.props.selectedWells.length > 0
                ? this.props.selectedWells
                : [this.props.well];

        return mapIndexed((well: WellBrief, index) => {
            const wellId = well.id;
            const wellType = well.charWorkId;
            const data = filter(it => it.wellId === wellId, this.props.data);
            const nextData =
                wells.length - 1 > index ? filter(it => it.wellId === wells[index + 1]?.id, this.props.data) : null;
            const perforation = filter(it => it.wellId === wellId, this.props.perforation);
            const trajectories = filter(it => it.wellId === wellId, this.props.trajectories);
            const wellLogging = filter(it => it.wellId === wellId, this.props.wellLogging);
            let researchInflowProfile = filter(
                it => it.wellId === wellId && includes(it.dt, this.props.selectedResearch),
                this.props.researchInflowProfile
            );

            const proxyData = filter(it => it.wellId === wellId, this.props.proxyData ?? []);

            const efficiencyData = filter(it => it.wellId === wellId, this.props.efficiencyData ?? []);

            const packerHistory = filter(it => it.wellId === wellId, this.props.packerHistory ?? []);

            const downholeHistory = filter(it => it.wellId === wellId, this.props.downholeHistory ?? []);

            const loggingChart = getLoggingChart(wellLogging);

            const trajectoryScale = scaleLinear()
                .domain(map(it => it.zAbs, trajectories))
                .range(map(it => it.z, trajectories));

            const canvasWidth = this.props.profileMode
                ? ColumnProfileElementWidth
                : ColumnGeneralElementWidth(packerHistory, downholeHistory, proxyData);

            const wellName = isNullOrEmpty(data) ? '' : head(data).wellName;

            if (this.props.profileMode) {
                const showStratigraphy = index === 0;

                const props: TabletProfileElementProps = {
                    scale: this.props.scale,

                    headerOffset: this.state.headerOffset,
                    zoom: this.state.zoom,

                    offsetX: offsetX,
                    width: showStratigraphy ? columnStratigraphyWidth + canvasWidth : canvasWidth,
                    height: this.canvasHeight,
                    minAbsDepth: this.minAbsDepth,
                    maxAbsDepth: this.maxAbsDepth,
                    minRealDepth: this.minRealDepth,
                    maxRealDepth: this.maxRealDepth,

                    wellName: wellName,
                    data: data,
                    nextData: nextData,
                    perforation: perforation,
                    trajectories: trajectories,
                    wellLogging: wellLogging,
                    researchInflowProfile: researchInflowProfile,

                    selectedLogging: this.props.selectedLogging,

                    showStratigraphy: showStratigraphy,

                    loggingChart: loggingChart,
                    trajectoryScale: trajectoryScale
                };

                offsetX += canvasWidth + columnStratigraphyWidth;

                return <TabletProfileElement {...props} />;
            } else {
                const props: TabletGeneralElementProps = {
                    columns: getColumns(data, packerHistory, downholeHistory, proxyData),
                    scale: this.props.scale,

                    headerOffset: this.state.headerOffset,
                    zoom: this.state.zoom,

                    offsetX: offsetX,
                    width: canvasWidth + efficiencyColumnWidth(efficiencyData) + 200,
                    height: this.canvasHeight,
                    minAbsDepth: this.minAbsDepth,
                    maxAbsDepth: this.maxAbsDepth,
                    minRealDepth: this.minRealDepth,
                    maxRealDepth: this.maxRealDepth,

                    wellId: wellId,
                    wellName: wellName,
                    wellType: wellType,
                    data: data,
                    nextData: nextData,
                    perforation: perforation,

                    trajectories: trajectories,
                    wellLogging: wellLogging,
                    researchInflowProfile: researchInflowProfile,

                    proxyData: proxyData,
                    packerHistory: packerHistory,
                    efficiencyData: efficiencyData,
                    efficiencyEvaluationType: this.props.efficiencyEvaluationType,
                    downholeHistory: downholeHistory,

                    selectedLogging: this.props.selectedLogging,

                    loggingChart: loggingChart,
                    trajectoryScale: trajectoryScale
                };

                offsetX += canvasWidth + 200;

                return <TabletGeneralElement {...props} />;
            }
        }, wells);
    }

    private renderTable = (svgKey, width, height) => {
        this.minAbsDepth = min(this.absDepth());
        this.maxAbsDepth = max(this.absDepth());

        const bodyHeight = this.bodyHeight();

        this.minRealDepth = min(this.realDepth());
        this.maxRealDepth = max(this.realDepth());

        this.canvasWidth =
            (this.props.profileMode
                ? ColumnProfileElementWidth
                : ColumnGeneralElementWidth(
                      this.props.packerHistory,
                      this.props.downholeHistory,
                      this.props.proxyData
                  )) + efficiencyColumnWidth(this.props.efficiencyData);

        this.canvasHeight = defaultHeaderHeight + bodyHeight;

        const toolbarProps: { position: ToolbarPosition } = {
            position: 'none'
        };

        const miniatureProps = this.minitiatureProps();

        return (
            <ReactSVGPanZoom
                key={svgKey}
                className={css.tablet__content}
                background={'none'}
                tool={this.state.pressCtrl ? TOOL_NONE : TOOL_AUTO}
                toolbarProps={toolbarProps}
                miniatureWidth={miniatureProps.width}
                miniatureHeight={miniatureProps.height}
                miniaturePosition='right'
                width={width}
                height={height}
                scaleFactorOnWheel={1.1}
                detectAutoPan={false}
                disableDoubleClickZoomWithToolAuto={true}
                /* eslint-disable @typescript-eslint/no-explicit-any */
                onPan={(e: any) => this.updateFixedHeaderPosition(e.f, e.a, e.e)}
                onZoom={(e: any) => this.updateFixedHeaderPosition(e.f, e.a, e.e)}
                onMouseMove={(e: any) => {
                    this.cursorPointX = e.x;
                    this.cursorPointY = e.y;

                    if (!isNil(this.state.polygon)) {
                        //this.setState({ cursorPoint: new Point(e.x, e.y) });
                    }
                }}
                /* eslint-enable @typescript-eslint/no-explicit-any */
                onClick={event => this.clickByMap(event)}
                onDoubleClick={() => this.clearPolygon()}
                ref={Viewer => {
                    if (!Viewer) {
                        return;
                    }

                    this.Viewer = Viewer;

                    if (this.isFirstVisit) {
                        this.Viewer.setPointOnViewerCenter(this.canvasWidth / 2, height - 100, this.state.zoom);
                        this.isFirstVisit = false;
                    }
                }}
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='map__canvas noselect'
                    viewBox={`${0} ${0} ${this.canvasWidth} ${this.canvasHeight}`}
                    x={0}
                    y={0}
                    width={this.canvasAllWidth}
                    height={this.canvasHeight}
                >
                    <>
                        <defs>
                            <pattern id='lithology1' patternUnits='userSpaceOnUse' width='30' height='20'>
                                <image xlinkHref='/images/tablet/limestone.png' x='0' y='0' width='30' height='20' />
                            </pattern>
                            <pattern id='lithology2' patternUnits='userSpaceOnUse' width='10' height='10'>
                                <image xlinkHref='/images/tablet/sandstone.png' x='0' y='0' width='10' height='10' />
                            </pattern>
                            <pattern id='lithology3' patternUnits='userSpaceOnUse' width='23' height='10'>
                                <image xlinkHref='/images/tablet/clay.png' x='0' y='0' width='23' height='10' />
                            </pattern>
                            <pattern id='packer1' patternUnits='userSpaceOnUse' width='211' height='1'>
                                <image xlinkHref='/images/tablet/packer.png' x='0' y='0' width='211' height='1' />
                            </pattern>
                            <pattern id='packerFilter' patternUnits='userSpaceOnUse' width='45' height='115'>
                                <image xlinkHref='/images/tablet/filter.svg' x='0' y='0' width='45' height='115' />
                            </pattern>
                            <filter x='0' y='0' width='1' height='1' id='bg-text'>
                                <feFlood floodColor='rgba(255, 255, 255, 0.8)' />
                                <feComposite in='SourceGraphic' />
                            </filter>
                            <linearGradient id='gradient1' x1='0%' y1='0%' x2='100%' y2='0%'>
                                <stop offset='0%' stopColor='#141216' stopOpacity='0.75' />
                                <stop offset='100%' stopColor='#564F58' stopOpacity='0.75' />
                            </linearGradient>
                            <linearGradient id='gradient2' x1='0%' y1='0%' x2='100%' y2='0%'>
                                <stop offset='0%' stopColor='#141216' stopOpacity='1' />
                                <stop offset='100%' stopColor='#564F58' stopOpacity='1' />
                            </linearGradient>
                        </defs>
                        <pattern id='diagonalHatchGreen' patternUnits='userSpaceOnUse' width='10' height='10'>
                            <path
                                d='M-2,2 l5,-5 M0,10 l10,-10 M8,12 l5,-5'
                                style={{ stroke: 'green', strokeWidth: 1 }}
                            />
                        </pattern>
                        <pattern id='diagonalHatchRed' patternUnits='userSpaceOnUse' width='10' height='10'>
                            <path d='M-2,2 l5,-5 M0,10 l10,-10 M8,12 l5,-5' style={{ stroke: 'red', strokeWidth: 1 }} />
                        </pattern>
                        {this.renderTableElement()}
                        {this.renderRuler()}
                    </>
                </svg>
            </ReactSVGPanZoom>
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private updateFixedHeaderPosition = (offset: number, zoom: number, x: number) => {
        const updateAction = () => {
            if ((offset < 0 || offset >= 0 || offset < 0) && this.props.fixedHeader) {
                //this.setState({ headerOffset: offset, zoom: zoom, xOffset: x });

                d3.selectAll('.tablet__header').attr('y', offset >= 0 ? 0 : Math.abs(offset / zoom)); // todo mb
            }
        };

        requestAnimationFrame(updateAction);
    };

    private renderZoomPanel(): JSX.Element {
        const exportIcons = [
            {
                id: 'export',
                tooltipText: i18n.t(dict.tablet.export),
                onClick: () => this.saveSvg(),
                renderContent: () => <ExportIcon boxSize={7} />
            }
        ];

        if (isFn(this.props.exportData)) {
            exportIcons.push({
                id: 'export_to_excel',
                tooltipText: i18n.t(dict.common.report.exportXlsx),
                onClick: () => this.saveXsls(),
                renderContent: () => <ExportXSLSIcon boxSize={7} />
            });
        }

        return (
            <div className={css.tablet__toolsContainer}>
                <div className={cls(css.tablet__tools, css.tablet__tools_zoom)}>
                    <ToolsGroup
                        direction={'vertical'}
                        tools={[
                            {
                                id: 'zoomIn',
                                tooltipText: i18n.t(dict.map.zoomIn),
                                onClick: () => this.Viewer.zoomOnViewerCenter(1.1),
                                renderContent: () => <PlusIcon boxSize={7} />
                            },
                            {
                                id: 'zoomOut',
                                tooltipText: i18n.t(dict.map.zoomOut),
                                onClick: () => this.Viewer.zoomOnViewerCenter(0.9),
                                renderContent: () => <MinusIcon boxSize={7} />
                            }
                        ]}
                    />
                    <ToolsGroup direction={'vertical'} tools={exportIcons} />
                </div>
            </div>
        );
    }

    private minitiatureProps = () => {
        let ratio = this.canvasWidth / this.canvasHeight;

        let miniatureWidth = 50;
        let miniatureHeight = miniatureWidth / ratio;

        if (miniatureHeight > 800) {
            miniatureHeight = 800;
            miniatureWidth = miniatureHeight * ratio;
        }

        this.canvasAllWidth = this.canvasWidth;
        if (this.props.selectedWells && this.props.selectedWells.length > 0) {
            this.canvasAllWidth =
                this.props.selectedWells && this.props.selectedWells.length > 0
                    ? this.canvasWidth * this.props.selectedWells.length +
                      (this.props.profileMode ? columnStratigraphyWidth : 200 * this.props.selectedWells.length)
                    : this.canvasWidth;

            ratio = this.canvasAllWidth / this.canvasHeight;
            miniatureWidth = miniatureHeight * ratio;
        }

        return {
            width: miniatureWidth,
            height: miniatureHeight
        };
    };

    private onClickByMinimap = e => {
        if (!this.minimapDrag && e.type !== 'click') {
            return;
        }

        const minimapProps = this.minitiatureProps();
        const y = e.layerY * (this.canvasHeight / minimapProps.height);

        this.Viewer.setPointOnViewerCenter(this.canvasWidth / 2, y, this.state.zoom);

        const offset = this.minimapDrag ? 0 : this.Viewer.Viewer.getValue().f;
        this.updateFixedHeaderPosition(offset, this.state.zoom, this.state.xOffset);
    };

    private onMouseDownByMinimap = () => {
        this.minimapDrag = true;
    };

    private onMouseUpByMinimap = () => {
        this.minimapDrag = false;
    };

    // todo mb
    private saveSvg = () => {
        const node = this.Viewer.ViewerDOM.children[1].children[1];
        const clone = node.cloneNode(true);

        const fields = clone.getElementsByClassName('tablet__header');
        for (let i = 0; i < fields.length; i++) {
            fields[i].setAttribute('y', 0);
        }

        document.getElementById('export_g').appendChild(clone);

        SvgAsPng.saveSvgAsPng(this.exportElement.current.children['0'], `tablet_export_${ddmmyyyy(new Date())}.png`);
    };

    private saveXsls = () => {
        this.props.exportData();
    };

    private clickByMap = event => {
        if (!this.state.pressCtrl) {
            return;
        }

        this.setState({ polygon: append(new Point(event.x, event.y), this.state.polygon) });
    };

    private clearPolygon() {
        this.setState({ polygon: [] });
    }

    private renderRuler() {
        if (isNullOrEmpty(this.state.polygon)) {
            return;
        }

        const padding = 10;

        const x1 = this.state.polygon[0].x;
        const y1 = this.state.polygon[0].y;
        const x2 = x1;
        const y2 = this.state.cursorPoint.y;

        const topAbsDepth = this.currentAbsDepth(y1);
        const topRealDepth = this.currentRealDepth(y1);
        const bottomAbsDepth = this.currentAbsDepth(y2);
        const bottomRealDepth = this.currentRealDepth(y2);

        return (
            <g>
                <line x1={x1 - padding} y1={y1} x2={x2 + padding} y2={y1} strokeWidth={2} stroke='red' />,
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} stroke='red' />,
                <line x1={x1 - padding} y1={y2} x2={x2 + padding} y2={y2} strokeWidth={2} stroke='red' />,
                <text
                    x={x1 + padding}
                    y={y1 + (y2 - y1) / 2}
                    fontSize={24}
                    filter='url(#bg-text)'
                    stroke='red'
                    fill='red'
                >
                    {distance(0, topRealDepth, 0, bottomRealDepth, 1).toFixed(1)}
                    {' (abs '}
                    {distance(0, topAbsDepth, 0, bottomAbsDepth, 1).toFixed(1)}
                    {') м'}
                </text>
            </g>
        );
    }
}

export class Tablet extends React.PureComponent<TabletProps, null> {
    public render(): React.ReactNode {
        return (
            <AutoSizer>
                {({ width, height }) =>
                    width && height ? <TabletComponent {...this.props} width={width} height={height} /> : null
                }
            </AutoSizer>
        );
    }
}
