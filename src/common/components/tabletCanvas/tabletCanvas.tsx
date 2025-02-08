import React, { memo, useCallback, useState } from 'react';

import { Flex } from '@chakra-ui/react';
import { CommonCanvasTablet } from 'common/entities/tabletCanvas/commonCanvasTablet';
import { WellBrief } from 'common/entities/wellBrief';
import { round1 } from 'common/helpers/math';
import { TabletColumn } from 'input/entities/tabletColumn';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';
import { ifElse, map, split } from 'ramda';
import ReactTooltip from 'react-tooltip';
import { AutoSizer } from 'react-virtualized';

import { CanvasSize } from '../../entities/canvas/canvasSize';
import { CommonCanvas } from '../../entities/canvas/commonCanvas';
import { MapLayer } from '../../entities/mapCanvas/layers/mapLayer';
import { isFn, isNullOrEmpty, nul } from '../../helpers/ramda';
import { useTabletInitialEffect } from './hooks/useTabletInitialEffect';
import { CommonTools } from './tools/commonTools';

export const CANVAS_TABLET_ELEMENT = 'canvasTablet';
export const MINIMAP_TABLET_ELEMENT = 'minimap';
export const MINIMAP_TABLET_CANVAS_ELEMENT = 'minimapCanvas';

export const HIDDEN_TABLET_ITEMS_ELEMENT = 'hiddenTabletItems';
export const HIDDEN_TABLET_CANVAS_ELEMENT = 'hiddenTabletCanvas';
export const EXPORT_TABLET_CANVAS_ELEMENT = 'exportTabletCanvas';

export interface TabletCanvasProps {
    canvasSize: CanvasSize;
    children?: JSX.Element | JSX.Element[];
    height?: number;
    layers: MapLayer[];
    plastId?: number;
    prodObjId?: number;
    width?: number;
    model: TabletDataModel;
    settings: TabletSettingsModel;
    selectedWells: WellBrief[];
    onChangeCursorPoint?(point: number[]): void;
    onClick?(point: number[]): void;
}

const Tablet = (props: TabletCanvasProps) => {
    const { canvasSize, height, width } = props;

    const { tablet, cursorPoint } = useTabletInitialEffect(props);

    const helper = new CommonCanvasTablet(canvasSize);
    const minimap = helper.minimapProps();

    const tooltipContent = e => {
        if (isNullOrEmpty(cursorPoint)) {
            return;
        }

        const scaleY = tablet.getScaleY();
        const trajectoryScale = tablet.getTrajectoryScale();
        const dataTip = tablet.getTooltipData();

        const y1 = cursorPoint[1];

        const absDepth = round1(trajectoryScale(scaleY.invert(y1)));
        const realDepth = round1(scaleY.invert(y1));

        const data = dataTip ? map(it => <p key={it}>{it}</p>, split('|', dataTip)) : null;

        return (
            <>
                <p>
                    H(md/abs): {absDepth}/{realDepth}
                </p>
                {data}
            </>
        );
    };

    return (
        <div>
            <div style={{ width: width, height: height, position: 'absolute' }}>
                <CommonTools
                    onZoomIn={() => tablet?.zoomIn()}
                    onZoomOut={() => tablet?.zoomOut()}
                    onInitialZoom={() => tablet?.initialPosition()}
                    onExport={() => tablet?.exportFile()}
                />
                <Flex position='absolute' flexDirection='column' bottom='10px' right='20px' alignItems='end' zIndex='1'>
                    <div id={MINIMAP_TABLET_ELEMENT}>
                        <canvas
                            id={MINIMAP_TABLET_CANVAS_ELEMENT}
                            key={MINIMAP_TABLET_CANVAS_ELEMENT}
                            width={minimap[0]}
                            height={minimap[1]}
                        />
                    </div>
                </Flex>
            </div>
            <canvas id={CANVAS_TABLET_ELEMENT} data-tip={''} data-for='tablet-tooltip' />
            <ReactTooltip
                id='tablet-tooltip'
                disable={false}
                data-html={true}
                effect='float'
                getContent={e => tooltipContent(e)}
            />
        </div>
    );
};

const TabletWrapper = (props: TabletCanvasProps) => {
    const onClick = useCallback(e => {
        ifElse(isFn, () => props.onClick(e), nul)(props.onClick);
    }, []);

    const helper = new CommonCanvasTablet(props.canvasSize);

    return (
        <AutoSizer>
            {({ width, height }) =>
                width === 0 || height === 0 ? null : (
                    <>
                        <Tablet {...props} width={width} height={height} onClick={onClick} />
                        <div id={HIDDEN_TABLET_ITEMS_ELEMENT} style={{ display: 'none' }}>
                            <canvas
                                id={EXPORT_TABLET_CANVAS_ELEMENT}
                                key={EXPORT_TABLET_CANVAS_ELEMENT}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </>
                )
            }
        </AutoSizer>
    );
};

export const TabletCanvas = memo(TabletWrapper);
