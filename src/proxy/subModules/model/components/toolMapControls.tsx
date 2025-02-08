import React, { FC } from 'react';

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { togglePolygonState } from '../../../../calculation/store/polygon';
import { selectedAdditionalWellState } from '../../../../calculation/store/selectedAdditionalWell';
import { RemoveIcon } from '../../../../common/components/customIcon/general';
import { ContourIcon } from '../../../../common/components/customIcon/map';
import { SearchTool } from '../../../../common/components/mapCanvas/searchTool';
import { cls } from '../../../../common/helpers/styles';

import css from '../../../../common/components/mapCanvas/map.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const ToolMapControls = () => {
    const { t } = useTranslation();

    const [togglePolygon, setTogglePolygon] = useRecoilState(togglePolygonState);

    const selectedAdditionalWell = useSetRecoilState(selectedAdditionalWellState);

    return (
        <div className={css.map__toolsContainer}>
            <div className={cls(css.map__tools, css.map__tools_actions)}>
                <SearchTool onSearch={selectedAdditionalWell} />
                <ButtonGroup pl={2} spacing={3} variant={'callWindow'}>
                    <Button
                        leftIcon={<ContourIcon boxSize={7} />}
                        variant={togglePolygon ? 'callWindowActive' : 'callWindow'}
                        onClick={() => setTogglePolygon(!togglePolygon)}
                    >
                        {t(dict.proxy.scenarioContour)}
                    </Button>
                    {togglePolygon && (
                        <Button onClick={() => setTogglePolygon(false)} px='4px'>
                            <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
                        </Button>
                    )}
                </ButtonGroup>
            </div>

            <ReactTooltip className={css.map__toolTooltip} effect='solid' />
        </div>
    );
};
