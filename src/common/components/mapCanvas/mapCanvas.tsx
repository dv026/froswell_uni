import React, { memo, useCallback, useState } from 'react';

import { Flex } from '@chakra-ui/react';
import { ifElse, map } from 'ramda';
import { AutoSizer } from 'react-virtualized';

import { CanvasSize } from '../../entities/canvas/canvasSize';
import { CommonCanvas } from '../../entities/canvas/commonCanvas';
import { MapLayer } from '../../entities/mapCanvas/layers/mapLayer';
import { WellPoint } from '../../entities/wellPoint';
import { MapSelectionType } from '../../enums/mapSelectionType';
import { WellTypeEnum } from '../../enums/wellTypeEnum';
import { isFn, nul } from '../../helpers/ramda';
import { CommonTools } from './commonTools';
import { useMapInitialEffect } from './hooks/useMapInitialEffect';
import { MainControls, ShowTools } from './mainControls';
import { OilReservesProps } from './oilReserves';

export interface MapCanvasProps {
    activeWell?: number;
    activeContourId?: number;
    additionalPoints?: number[][];
    canvasSize: CanvasSize;
    children?: JSX.Element | JSX.Element[];
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
    multipleWellsSelected?(wells: Array<WellPoint>, selectionType: MapSelectionType): void;
    onChangeCursorPoint?(point: number[]): void;
    onChangePolygonSelected?(polygon: number[][], selectionType: MapSelectionType): void;
    onClick?(point: number[]): void;
    onDoubleClick?(point: number[]): void;
    onExportGrid?(): void;
    onSelectWell?: (id: number, type: WellTypeEnum, pos: number[]) => void;
}

const Map = (props: MapCanvasProps) => {
    const { canvasSize, height, mainControlHideTools, showZValue, width, onExportGrid } = props;

    const [selectionType, setSelectionType] = useState<MapSelectionType>(MapSelectionType.Contour);

    const { map, cursorPoint } = useMapInitialEffect(props, selectionType);

    const helper = new CommonCanvas(canvasSize);
    const minimap = helper.minimapProps();

    return (
        <div key='canvasMap'>
            <div style={{ width: width, height: height, position: 'absolute' }}>
                {map && (
                    <MainControls
                        cursorPoint={cursorPoint}
                        hideContourSection={false}
                        lastPoint={map.getLastPoint()}
                        onExportFile={map.exportFile}
                        onExportGridFile={onExportGrid}
                        onMapSelectionType={setSelectionType}
                        onSearch={map.searchWell}
                        selectionType={selectionType}
                        showCsvExport={showZValue}
                        showTools={mainControlHideTools}
                    />
                )}
                <Flex position='absolute' flexDirection='column' bottom='75px' right='25px' alignItems='end' zIndex='1'>
                    <CommonTools
                        onZoomIn={() => map?.zoomIn()}
                        onZoomOut={() => map?.zoomOut()}
                        onInitialZoom={() => map?.initialPosition()}
                    />
                    <div id='minimap'>
                        <canvas id='minimapCanvas' key='minimapCanvas' width={minimap[0]} height={minimap[1]} />
                    </div>
                </Flex>
            </div>
            <canvas id='canvasMap' />
        </div>
    );
};

interface WithTypedChildred extends React.PropsWithChildren<MapCanvasProps> {
    children?: React.ReactElement<OilReservesProps>[] | React.ReactElement<OilReservesProps>;
}

const MapWrapper = (props: WithTypedChildred) => {
    const [polygon, setPolygon] = useState<number[][]>();
    const [disable, setDisable] = useState<boolean>(true);

    const onClick = useCallback(e => {
        ifElse(isFn, () => props.onClick(e), nul)(props.onClick);
    }, []);

    const onChangePolygonSelected = useCallback((polygon, type) => {
        props.onChangePolygonSelected &&
            isFn(props.onChangePolygonSelected) &&
            props.onChangePolygonSelected(polygon, type);

        setPolygon(polygon);
        setDisable(type !== MapSelectionType.Reserves);
    }, []);

    const helper = new CommonCanvas(props.canvasSize);

    const updatedChildren = (width: number) =>
        React.Children.map(props.children, (x: React.ReactElement<OilReservesProps>) => {
            if (x.props && typeof x.props.polygon !== 'undefined') {
                return React.cloneElement(
                    x,
                    Object.assign({}, x.props, {
                        polygon: map(it => ({ x: it[0], y: it[1] }), polygon || []),
                        disable: disable,
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
                            {...props}
                            width={width}
                            height={height}
                            onClick={props.onClick}
                            onChangePolygonSelected={onChangePolygonSelected}
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
};

export const MapCanvas = memo(MapWrapper);
