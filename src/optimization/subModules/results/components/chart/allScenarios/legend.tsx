import React, { FC } from 'react';

import { Center } from '@chakra-ui/react';
import i18n from 'i18next';
import { any, equals, map } from 'ramda';

import colors from '../../../../../../../theme/colors';
import { Cell, ThumbFillEnum } from '../../../../../../common/components/charts/legends/cell';
import { CustomControlProps } from '../../../../../../common/components/customControl';
import { FavoriteIcon } from '../../../../../../common/components/customIcon/general';
import { RGBA } from '../../../../../../common/helpers/colors';
import { cls } from '../../../../../../common/helpers/styles';

import css from './../../../../../../common/components/charts/legends/cell.module.less';

import dict from '../../../../../../common/helpers/i18n/dictionary/main.json';

interface LegendProps extends CustomControlProps {
    optimizations: [string, number, string][]; // key, index, color. I.e.: ['optimization_1', 1, '#00000']
    onClick: (key: string) => void;
    hiddenLines: string[];
    maxInRow?: number;
    bestMainO: number;
    isOil: boolean;
}

export const Legend: FC<LegendProps> = (p: LegendProps) => {
    return (
        <div className={cls(css.legend, p.className)}>
            {map(
                o => (
                    <LegendCell
                        key={o[0]}
                        optimization={o}
                        bestMainO={p.bestMainO}
                        onClick={() => p.onClick(o[0])}
                        hiddenLines={p.hiddenLines}
                        isOil={p.isOil}
                    />
                ),
                p.optimizations
            )}
        </div>
    );
};

const LegendCell: React.FC<{
    optimization: [string, number, RGBA | string];
    onClick: () => void;
    bestMainO: number;
    hiddenLines: string[];
    isOil: boolean;
}> = ({ optimization, onClick, hiddenLines, bestMainO, isOil }) => {
    const hidden = any(equals(optimization[0]), hiddenLines);

    return (
        <Cell
            text={getText(optimization[1])}
            onClick={onClick}
            active={optimization[1] === bestMainO}
            color={
                optimization[1] === bestMainO
                    ? isOil
                        ? colors.paramColors.oil
                        : colors.paramColors.injection
                    : optimization[2]
            }
            hidden={hidden}
            fill={optimization[1] === 0 ? ThumbFillEnum.HollowDashed : ThumbFillEnum.HollowSolid}
        >
            <Center>
                {optimization[1] === bestMainO && (
                    <FavoriteIcon boxSize={6} color={isOil ? colors.bg.brand : colors.colors.blue} />
                )}
            </Center>
        </Cell>
    );
};

const getText = (index: number): string => (index > 0 ? `${i18n.t(dict.common.scenario)} ${index}` : 'Без оптимизации');
