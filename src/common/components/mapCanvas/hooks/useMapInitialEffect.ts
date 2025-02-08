import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from 'common/components/hooks/useDebounce/useDebounce';
import { KeyCodeEnum } from 'common/enums/keyCodesEnum';
import { MapSelectionType } from 'common/enums/mapSelectionType';
import { mapScaleState } from 'common/store/mapScale';
import { ifElse } from 'ramda';
import { useRecoilValue } from 'recoil';

import { BaseMap } from '../../../entities/mapCanvas/baseMap';
import { isFn, nul } from '../../../helpers/ramda';
import { MapCanvasProps } from '../mapCanvas';

export function useMapInitialEffect(props: MapCanvasProps, selectionType: MapSelectionType) {
    const {
        activeWell = 0,
        additionalPoints = [],
        canvasSize,
        disableDragAndDrop,
        disablePolygon,
        gridStepSize = 50,
        height = 800,
        layers,
        plastId,
        points = [],
        prodObjId,
        selectedAdditionalWell,
        showZValue = false,
        togglePolygon = false,
        width = 800,
        multipleWellsSelected,
        onChangeCursorPoint,
        onChangePolygonSelected,
        onClick,
        onDoubleClick,
        onSelectWell
    } = props;

    const scale = useRecoilValue(mapScaleState);

    const [cursorPoint, setCursorPoint] = useState<number[]>(null);
    const [pressCtrl, setPressCtrl] = useState<boolean>(false);

    const map = useRef<BaseMap>(null);

    useEffect(() => {
        map.current = new BaseMap(
            canvasSize,
            width,
            height,
            layers,
            points,
            activeWell,
            additionalPoints,
            gridStepSize,
            showZValue,
            scale,
            disableDragAndDrop
        );

        map.current.onCursorPointMove = onCursorPointMove;
        map.current.multipleWellsSelected = multipleWellsSelectedHandler;
        map.current.onChangePolygonSelected = onChangePolygonSelectedHandler;
        map.current.onSelectWell = onSelectWell;
        map.current.onClick = onClick;
        map.current.onDoubleClick = onDoubleClick;

        map.current.init();

        document.addEventListener('keydown', keyDownFunction, false);

        return () => {
            document.removeEventListener('keydown', keyDownFunction, false);
        };
    }, []);

    useEffect(() => {
        map.current.multipleWellsSelected = multipleWellsSelectedHandler;
        map.current.onChangePolygonSelected = onChangePolygonSelectedHandler;
        map.current.onSelectWell = onSelectWell;
        map.current.onClick = onClick;
        map.current.onDoubleClick = onDoubleClick;
    }, [multipleWellsSelected, onChangePolygonSelected, onSelectWell, onClick, onDoubleClick]);

    useEffect(() => {
        map.current.setPoints(points);
    }, [points]);

    useEffect(() => {
        map.current.setCanvasSize(canvasSize);
    }, [canvasSize]);

    useEffect(() => {
        map.current.setSelectionType(selectionType);
    }, [selectionType]);

    useEffect(() => {
        map.current.setShowZValues(additionalPoints, gridStepSize, showZValue);
    }, [additionalPoints, gridStepSize, showZValue]);

    useEffect(() => {
        map.current.setViewBox(width, height);
    }, [width, height]);

    useEffect(() => {
        map.current.setDisableDragAndDrop(disableDragAndDrop);
    }, [disableDragAndDrop]);

    useEffect(() => {
        map.current.updateChangedLayers(layers);
    }, [layers]);

    useEffect(() => {
        map.current.setActiveWell(activeWell);
    }, [activeWell]);

    useEffect(() => {
        map.current.setPlast(plastId);
    }, [plastId]);

    useEffect(() => {
        map.current.setProductionObject(prodObjId);
    }, [prodObjId]);

    useEffect(() => {
        map.current.setTogglePolygon(togglePolygon);
    }, [togglePolygon]);

    useEffect(() => {
        map.current.clearPolygon();
    }, [disablePolygon]);

    useEffect(() => {
        map.current.searchWell(selectedAdditionalWell);
    }, [selectedAdditionalWell]);

    useEffect(() => {
        map.current.setScale(scale);
    }, [scale]);

    const keyDownFunction = event => {
        if (event.keyCode === KeyCodeEnum.ESCAPE) {
            map.current.clearPolygon();
        } else if (event.keyCode === KeyCodeEnum.CTRL) {
            if (pressCtrl !== event.ctrlKey) {
                setPressCtrl(event.ctrlKey);
            }
        } else if (event.keyCode === KeyCodeEnum.LEFT_META) {
            setPressCtrl(!pressCtrl);
        } else if (event.keyCode === KeyCodeEnum.ENTER) {
            map.current.connectPolygon();
        }
    };

    const multipleWellsSelectedHandler = (wells, selectionType) => {
        ifElse(isFn, () => multipleWellsSelected(wells, selectionType), nul)(multipleWellsSelected);
    };

    const onChangePolygonSelectedHandler = (newPolygon, selectionType) => {
        ifElse(isFn, () => onChangePolygonSelected(newPolygon, selectionType), nul)(onChangePolygonSelected);
    };

    const onCursorPointMove = (p: number[]) => {
        setCursorPoint(p);

        ifElse(isFn, () => onChangeCursorPoint(p), nul)(onChangeCursorPoint);
    };

    const onSearchWellHandler = value => {
        map.current.searchWell(value);
    };

    return { map: map.current, cursorPoint };
}
