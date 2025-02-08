import React, { memo } from 'react';

import { Flex } from '@chakra-ui/react';
import { ifElse, map } from 'ramda';
import { ReactFauxDomProps, withFauxDOM } from 'react-faux-dom';
import { AutoSizer } from 'react-virtualized';

import { CanvasSize } from '../../entities/canvas/canvasSize';
import { CommonCanvas } from '../../entities/canvas/commonCanvas';
import { BaseMap } from '../../entities/mapCanvas/baseMap';
import { MapLayer } from '../../entities/mapCanvas/layers/mapLayer';
import { WellPoint } from '../../entities/wellPoint';
import { KeyCodeEnum } from '../../enums/keyCodesEnum';
import { MapSelectionType } from '../../enums/mapSelectionType';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { isNullOrEmpty, isFn, nul } from '../../helpers/ramda';
import { CommonTools } from './commonTools';
import { MainControls, ShowTools } from './mainControls';
import { OilReservesProps } from './oilReserves';

interface MapCanvasProps extends ReactFauxDomProps {
    activeWell?: number;

    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalPoints?: number[][];
    canvasSize: CanvasSize;
    disableDragAndDrop?: boolean;
    disablePolygon?: boolean;
    gridStepSize?: number;
    height?: number;
    layers: MapLayer[];
    mainControlHideTools?: ShowTools;
    plastId?: number;
    points?: WellPoint[];
    prodObjId?: number;
    selectedAdditionalWell?: string;
    showZValue?: boolean;
    togglePolygon?: boolean;
    width?: number;
    children?: JSX.Element | JSX.Element[];
    multipleWellsSelected?(wells: Array<WellPoint>, selectionType: MapSelectionType): void;
    onChangePolygonSelected?(polygon: number[][], selectionType: MapSelectionType): void;
    onSelectWell?: (id: number, type: WellTypeEnum, pos: number[]) => void;
    onChangeCursorPoint?(point: number[]): void;
    onClick?(point: number[]): void;
    onDoubleClick?(point: number[]): void;
    onExportGrid?(): void;
}

interface MapState {
    cursorPoint: number[];
    selectionType: MapSelectionType;
    pressCtrl: boolean;
}

class Map extends React.Component<MapCanvasProps, MapState> {
    private map: BaseMap;

    private onKeyDownHandler;

    public constructor(props, context) {
        super(props, context);

        this.map = new BaseMap(
            this.props.canvasSize,
            this.props.width,
            this.props.height,
            this.props.layers,
            this.props.points,
            this.props.activeWell,
            this.props.additionalPoints,
            this.props.gridStepSize,
            this.props.showZValue,
            1,
            false
        );

        this.map.onCursorPointMove = this.onCursorPointMove;
        this.map.multipleWellsSelected = this.multipleWellsSelected;
        this.map.onChangePolygonSelected = this.onChangePolygonSelected;
        this.map.onSelectWell = this.props.onSelectWell;
        this.map.onClick = this.props.onClick;
        this.map.onDoubleClick = this.props.onDoubleClick;

        this.state = {
            cursorPoint: [],
            selectionType: MapSelectionType.Contour,
            pressCtrl: false
        };

        this.onKeyDownHandler = this.keyDownFunction.bind(this);
    }

    public componentDidMount() {
        // todo mb
        this.initLayers(this.props.layers);

        this.map.init();

        document.addEventListener('keydown', this.onKeyDownHandler, false);
    }

    public componentDidUpdate(prevProps, prevState) {
        let update = false;
        let updateMinimap = false;

        // todo mb
        if (
            this.props.multipleWellsSelected !== prevProps.multipleWellsSelected ||
            this.props.onChangePolygonSelected !== prevProps.onChangePolygonSelected ||
            this.props.onSelectWell !== prevProps.onSelectWell ||
            this.props.onClick !== prevProps.onClick ||
            this.props.onDoubleClick !== prevProps.onDoubleClick
        ) {
            this.map.multipleWellsSelected = this.multipleWellsSelected;
            this.map.onChangePolygonSelected = this.onChangePolygonSelected;
            this.map.onSelectWell = this.props.onSelectWell;
            this.map.onClick = this.props.onClick;
            this.map.onDoubleClick = this.props.onDoubleClick;
        }

        if (
            this.props.points !== prevProps.points ||
            this.props.canvasSize !== prevProps.canvasSize ||
            this.state.selectionType !== prevState.selectionType ||
            !isNullOrEmpty(prevState.polygon)
        ) {
            this.map.setPoints(this.props.points);
            this.map.setCanvasSize(this.props.canvasSize);
            this.map.setSelectionType(this.state.selectionType);
            update = true;
            updateMinimap = true;
        }

        if (
            this.props.additionalPoints !== prevProps.additionalPoints ||
            this.props.gridStepSize !== prevProps.gridStepSize ||
            this.props.showZValue !== prevProps.showZValue
        ) {
            this.map.setShowZValues(this.props.additionalPoints, this.props.gridStepSize, this.props.showZValue);
            update = true;
        }

        if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            this.map.setViewBox(this.props.width, this.props.height);
            update = true;
        }

        if (this.props.disableDragAndDrop) {
            update = true;
        }

        if (this.props.layers !== prevProps.layers) {
            this.updateChangedLayers(this.props.layers, prevProps.layers);
            update = true;
            updateMinimap = true;
        }

        if (this.props.activeWell !== prevProps.activeWell) {
            this.map.setActiveWell(this.props.activeWell);
            if (this.props.activeWell !== null) {
                this.map.initialPosition();
            }

            update = true;
        }

        if (this.props.plastId !== prevProps.plastId) {
            this.map.setPlast(this.props.plastId);
            this.map.initialPosition();
            update = true;
            updateMinimap = true;
        }

        if (this.props.prodObjId !== prevProps.prodObjId) {
            this.map.initialPosition();
            update = true;
            updateMinimap = true;
        }

        if (this.props.togglePolygon !== prevProps.togglePolygon) {
            this.map.setTogglePolygon(this.props.togglePolygon);
            update = true;
        }

        if (this.props.disablePolygon !== prevProps.disablePolygon) {
            this.map.clearPolygon();
            update = true;
        }

        if (this.props.selectedAdditionalWell !== prevProps.selectedAdditionalWell) {
            this.map.searchWell(this.props.selectedAdditionalWell);
        }

        if (update) {
            this.map.update();
        }

        if (updateMinimap) {
            this.map.updateMinimap();
        }
    }

    private updateChangedLayers = (current, prev) => {
        if (current.length !== prev.length) {
            return;
        }

        for (let i = 0; i < current.length; i++) {
            if (isFn(current[i].equals) && !current[i].equals(prev[i])) {
                this.map.setLayerByIndex(i, current[i]);
            }
        }
    };

    private initLayers = current => {
        for (let i = 0; i < current.length; i++) {
            if (isFn(current[i].equals)) {
                this.map.setLayerByIndex(i, current[i]);
            }
        }
    };

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDownHandler, false);
    }

    private keyDownFunction = event => {
        if (event.keyCode === KeyCodeEnum.ESCAPE) {
            this.map.clearPolygon();
        } else if (event.keyCode === KeyCodeEnum.CTRL) {
            if (this.state.pressCtrl !== event.ctrlKey) {
                this.setState({ pressCtrl: event.ctrlKey });
            }
        } else if (event.keyCode === KeyCodeEnum.LEFT_META) {
            // mac os
            this.setState({ pressCtrl: !this.state.pressCtrl });
        } else if (event.keyCode === KeyCodeEnum.ENTER) {
            this.map.connectPolygon();
        }
    };

    private multipleWellsSelected = wells => {
        ifElse(
            isFn,
            () => this.props.multipleWellsSelected(wells, this.state.selectionType),
            nul
        )(this.props.multipleWellsSelected);
    };

    private onChangePolygonSelected = newPolygon => {
        ifElse(
            isFn,
            () => this.props.onChangePolygonSelected(newPolygon, this.state.selectionType),
            nul
        )(this.props.onChangePolygonSelected);
    };

    private onCursorPointMove = (p: number[]) => {
        this.setState({ cursorPoint: p });

        ifElse(isFn, () => this.props.onChangeCursorPoint(p), nul)(this.props.onChangeCursorPoint);
    };

    private onSearchWell = value => {
        this.map.searchWell(value);
    };

    public render() {
        const helper = new CommonCanvas(this.props.canvasSize);
        const minimap = helper.minimapProps();

        return (
            <div key='canvasMap'>
                <div style={{ width: this.props.width, height: this.props.height, position: 'absolute' }}>
                    <MainControls
                        cursorPoint={this.state.cursorPoint}
                        hideContourSection={false}
                        lastPoint={this.map.getLastPoint()}
                        onExportFile={this.map.exportFile}
                        onExportGridFile={this.props.onExportGrid}
                        onMapSelectionType={(type: MapSelectionType) => this.setState({ selectionType: type })}
                        onSearch={this.map.searchWell}
                        selectionType={this.state.selectionType}
                        showCsvExport={this.props.showZValue}
                        showTools={this.props.mainControlHideTools}
                    />
                    <Flex
                        position='absolute'
                        flexDirection='column'
                        bottom='75px'
                        right='25px'
                        alignItems='end'
                        zIndex='1'
                    >
                        <CommonTools
                            onZoomIn={() => this.map.zoomIn()}
                            onZoomOut={() => this.map.zoomOut()}
                            onInitialZoom={() => this.map.initialPosition()}
                        />
                        <div id='minimap'>
                            <canvas id='minimapCanvas' key='minimapCanvas' width={minimap[0]} height={minimap[1]} />
                        </div>
                    </Flex>
                </div>
                <canvas id='canvasMap' />
            </div>
        );
    }
}

interface WithTypedChildred extends React.PropsWithChildren<MapCanvasProps> {
    children: React.ReactElement<OilReservesProps>[] | React.ReactElement<OilReservesProps>;
}

interface MapWrapperState {
    polygon: number[][];
    disable: boolean;
}

class MapWrapper extends React.PureComponent<WithTypedChildred, MapWrapperState> {
    public constructor(props, context) {
        super(props, context);

        this.state = {
            polygon: null,
            disable: true
        };
    }

    private onClick = e => {
        ifElse(isFn, () => this.props.onClick(e), nul)(this.props.onClick);
    };

    private onChangePolygonSelected = (polygon, type) => {
        ifElse(isFn, () => this.props.onChangePolygonSelected(polygon, type), nul)(this.props.onChangePolygonSelected);

        this.setState({ polygon: polygon, disable: type !== MapSelectionType.Reserves });
    };

    public render() {
        const helper = new CommonCanvas(this.props.canvasSize);

        const updatedChildren = (width: number) =>
            React.Children.map(this.props.children, (x: React.ReactElement<OilReservesProps>) => {
                if (x.props && typeof x.props.polygon !== 'undefined') {
                    return React.cloneElement(
                        x,
                        Object.assign({}, x.props, {
                            polygon: map(it => ({ x: it[0], y: it[1] }), this.state.polygon || []),
                            disable: this.state.disable,
                            width: width
                        })
                    );
                }

                return x;
            });

        return (
            <AutoSizer>
                {({ width, height }) =>
                    width === 0 || height === 0 ? null : (
                        <>
                            <Map
                                {...this.props}
                                width={width}
                                height={height}
                                onClick={this.onClick.bind(this)}
                                onChangePolygonSelected={this.onChangePolygonSelected.bind(this)}
                            />
                            <div id={'hiddenItems'} style={{ display: 'none' }}>
                                <canvas
                                    id='hiddenCanvas'
                                    key='hiddenCanvas'
                                    width={helper.gridWidth()}
                                    height={helper.gridHeight()}
                                    style={{ display: 'none' }}
                                />
                                <canvas id='exportCanvas' key='exportCanvas' style={{ display: 'none' }} />
                            </div>
                            {updatedChildren(width)}
                        </>
                    )
                }
            </AutoSizer>
        );
    }
}

export const MapCanvas = memo(withFauxDOM<MapCanvasProps>(MapWrapper));
