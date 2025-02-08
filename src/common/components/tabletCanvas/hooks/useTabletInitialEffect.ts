import { useEffect, useRef, useState } from 'react';

import { BaseTablet } from 'common/entities/tabletCanvas/baseTablet';
import { KeyCodeEnum } from 'common/enums/keyCodesEnum';
import { ifElse } from 'ramda';

import { isFn, nul } from '../../../helpers/ramda';
import { TabletCanvasProps } from '../tabletCanvas';

export function useTabletInitialEffect(props: TabletCanvasProps) {
    const {
        canvasSize,
        width,
        height,
        layers,
        model,
        settings,
        selectedWells,
        prodObjId,
        onChangeCursorPoint,
        onClick
    } = props;

    const [cursorPoint, setCursorPoint] = useState<number[]>(null);
    const [pressCtrl, setPressCtrl] = useState<boolean>(false);

    const tablet = useRef<BaseTablet>(null);

    useEffect(() => {
        tablet.current = new BaseTablet(canvasSize, width, height, layers, model, settings, selectedWells, prodObjId);

        tablet.current.onCursorPointMove = onCursorPointMove;
        tablet.current.onClick = onClick;

        tablet.current.init();

        document.addEventListener('keydown', keyDownFunction, false);

        return () => {
            document.removeEventListener('keydown', keyDownFunction, false);

            tablet.current = null;
        };
    }, []);

    useEffect(() => {
        tablet.current.onClick = onClick;
    }, [onClick]);

    useEffect(() => {
        tablet.current.onCursorPointMove = onCursorPointMove;
    }, [onChangeCursorPoint]);

    useEffect(() => {
        tablet.current.setCanvasSize(canvasSize);
    }, [canvasSize]);

    useEffect(() => {
        tablet.current.setViewBox(width, height);
    }, [width, height]);

    useEffect(() => {
        tablet.current.updateChangedLayers(layers);
    }, [layers]);

    useEffect(() => {
        tablet.current.setModel(model);
    }, [model]);

    useEffect(() => {
        tablet.current.setSettings(settings);
    }, [settings]);

    useEffect(() => {
        tablet.current.setCanvasSize(canvasSize);
    }, [canvasSize]);

    const keyDownFunction = event => {
        if (event.keyCode === KeyCodeEnum.CTRL) {
            if (pressCtrl !== event.ctrlKey) {
                setPressCtrl(event.ctrlKey);
            }
        } else if (event.keyCode === KeyCodeEnum.LEFT_META) {
            setPressCtrl(!pressCtrl);
        }
    };

    const onCursorPointMove = (p: number[]) => {
        setCursorPoint(p);

        ifElse(isFn, () => onChangeCursorPoint(p), nul)(onChangeCursorPoint);
    };

    return { tablet: tablet.current, cursorPoint };
}
