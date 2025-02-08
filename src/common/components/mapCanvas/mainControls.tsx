import React, { FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';

import { MapSelectionType } from '../../enums/mapSelectionType';
import { trueOrNull, isNullOrEmpty } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import {
    ContourIcon,
    ContourOptionalIcon,
    ExportCSVIcon,
    ExportIcon,
    ProfileIcon,
    ReservesCalculationIcon
} from '../customIcon/map';
import { SearchTool } from './searchTool';

import cssTools from '../tools/tools.module.less';
import css from './map.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

export interface ShowTools {
    search?: boolean;
    contour?: boolean;
    contourOptional?: boolean;
    profile?: boolean;
    reservesCalculation?: boolean;
    export?: boolean;
}

interface MainControlsProps {
    selectionType: MapSelectionType;
    hideContourSection: boolean;
    cursorPoint: number[];
    lastPoint: number[];
    showTools?: ShowTools;
    showCsvExport?: boolean;
    onMapSelectionType?: (type: MapSelectionType) => void;
    onExportFile?: () => void;
    onExportGridFile?: () => void;
    onSearch?: (str: string) => void;
}

export const MainControls: FC<MainControlsProps> = (p: MainControlsProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        ReactTooltip.rebuild();
    });

    const contourSelection = p.selectionType === MapSelectionType.Contour;

    const contourOptionalSelection = p.selectionType === MapSelectionType.ContourOptional;

    const profileSelection = p.selectionType === MapSelectionType.Profile;

    const reservesSelection = p.selectionType === MapSelectionType.Reserves;

    const dist = (prev, current) => {
        return Math.round(Math.sqrt(Math.pow(prev[0] - current[0], 2) + Math.pow(prev[1] - current[1], 2)));
    };

    const azimuth = (prev, current) => {
        if ((Math.atan2(prev[1] - current[1], prev[0] - current[0]) / Math.PI) * 180 - 90 > 0) {
            return Math.round(
                Math.abs((Math.atan2(prev[1] - current[1], prev[0] - current[0]) / Math.PI) * 180 - 90 - 360)
            );
        } else {
            return Math.round(Math.abs((Math.atan2(prev[1] - current[1], prev[0] - current[0]) / Math.PI) * 180 - 90));
        }
    };

    return (
        <div className={css.map__toolsContainer}>
            {!isNullOrEmpty(p.cursorPoint) ? (
                <div className={css.map__container}>
                    <>
                        {!isNullOrEmpty(p.lastPoint) ? (
                            <div className={css.map__polygon}>
                                <div className={css.cursor__param}>
                                    <span>
                                        {' '}
                                        {t(dict.map.length)}: {dist(p.cursorPoint, p.lastPoint)}м
                                    </span>
                                </div>
                                <div className={css.cursor__param}>
                                    <span>
                                        {t(dict.map.azimuth)}: {azimuth(p.cursorPoint, p.lastPoint)}°
                                    </span>
                                </div>
                            </div>
                        ) : null}
                        <div className={css.map__cursor_point}>
                            <div className={css.cursor__param}>
                                <span> x: {p.cursorPoint[0]}</span>
                            </div>
                            <div className={css.cursor__param}>
                                <span> y: {p.cursorPoint[1]}</span>
                            </div>
                            {p.cursorPoint[2] ? (
                                <div className={css.cursor__param}>
                                    <span> z: {p.cursorPoint[2]}</span>
                                </div>
                            ) : null}
                        </div>
                    </>
                </div>
            ) : null}
            <>
                <div className={cls(css.map__tools, css.map__tools_actions)}>
                    {p.showTools?.search ? (
                        <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_x)}>
                            <SearchTool onSearch={p.onSearch} />
                        </div>
                    ) : null}

                    {trueOrNull(
                        !p.hideContourSection &&
                            (p.showTools?.contour || p.showTools?.profile || p.showTools?.reservesCalculation),
                        <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_x)}>
                            {p.showTools?.contour ? (
                                <div
                                    data-tip={t(dict.map.contour)}
                                    className={cls(cssTools.tool, trueOrNull(contourSelection, cssTools.tool_active))}
                                    onClick={() => p.onMapSelectionType(MapSelectionType.Contour)}
                                >
                                    <ContourIcon boxSize={6} />
                                </div>
                            ) : null}
                            {p.showTools?.contourOptional ? (
                                <div
                                    data-tip={t(dict.map.contourLiquidDistribution)}
                                    className={cls(
                                        cssTools.tool,
                                        trueOrNull(contourOptionalSelection, cssTools.tool_active)
                                    )}
                                    onClick={() => p.onMapSelectionType(MapSelectionType.ContourOptional)}
                                >
                                    <ContourOptionalIcon boxSize={6} />
                                </div>
                            ) : null}
                            {p.showTools?.profile ? (
                                <div
                                    data-tip={t(dict.map.profile)}
                                    className={cls(cssTools.tool, trueOrNull(profileSelection, cssTools.tool_active))}
                                    onClick={() => p.onMapSelectionType(MapSelectionType.Profile)}
                                >
                                    <ProfileIcon boxSize={6} />
                                </div>
                            ) : null}
                            {p.showTools?.reservesCalculation ? (
                                <div
                                    data-tip={t(dict.map.reservesCalculation)}
                                    className={cls(cssTools.tool, trueOrNull(reservesSelection, cssTools.tool_active))}
                                    onClick={() => p.onMapSelectionType(MapSelectionType.Reserves)}
                                >
                                    <ReservesCalculationIcon boxSize={6} />
                                </div>
                            ) : null}
                        </div>
                    )}

                    {p.showTools?.export ? (
                        <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_x)}>
                            {/* TODO: разобраться с использованием this - есть ли он здесь вообще? */}
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-ignore */}
                            <div className={cssTools.tool} data-tip={t(dict.map.export)} onClick={p.onExportFile}>
                                <ExportIcon boxSize={6} />
                            </div>
                            {p.showCsvExport ? (
                                <div
                                    className={cssTools.tool}
                                    data-tip={t(dict.map.exportGrid)}
                                    onClick={p.onExportGridFile}
                                >
                                    <ExportCSVIcon boxSize={6} />
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <ReactTooltip className={css.map__toolTooltip} effect='solid' />
            </>
        </div>
    );
};
