import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { cls } from '../../helpers/styles';
import { MinusIcon, PlusIcon } from '../customIcon/general';
import { GeoIcon, MapScaleIcon } from '../customIcon/map';
import { MapScaleModal } from './modal/mapScaleModal';

import cssTools from '../tools/tools.module.less';
import css from './map.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

interface MainControlsProps {
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onInitialZoom?: () => void;
}

export const CommonTools: FC<MainControlsProps> = (p: MainControlsProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <div className={cls(css.map__tools, css.map__tools_zoom)}>
                <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_y)}>
                    <div className={cssTools.tool} onClick={() => p.onZoomIn()} data-tip={t(dict.map.zoomIn)}>
                        <PlusIcon boxSize={7} />
                    </div>
                    <div className={cssTools.tool} onClick={() => p.onZoomOut()} data-tip={t(dict.map.zoomOut)}>
                        <MinusIcon boxSize={7} />
                    </div>
                </div>
                <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_y)}>
                    <div
                        className={cssTools.tool}
                        data-tip={t(dict.map.startPosition)}
                        onClick={() => p.onInitialZoom()}
                    >
                        <GeoIcon boxSize={7} />
                    </div>
                </div>
                <div className={cls(cssTools.toolsGroup, cssTools.toolsGroup_y)}>
                    <div className={cssTools.tool} data-tip={t(dict.map.scale)}>
                        <MapScaleModal />
                    </div>
                </div>
            </div>
        </Box>
    );
};
