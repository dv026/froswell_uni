import React, { FC } from 'react';

import { any, append, equals, reject } from 'ramda';

import { Cell, ThumbFillEnum } from '../../../../../../common/components/charts/legends/cell';
import * as Prm from '../../../../../../common/helpers/parameters';
import { cls } from '../../../../../../common/helpers/styles';
import { correctedPressureZabLabel } from './chartBestMainO';

import css from './../../../../../../common/components/charts/legends/cell.module.less';

interface Props {
    accumulated?: boolean;
    accumHasOil: boolean;
    accumHasInj: boolean;
    hasOil: boolean;
    hasInj: boolean;
    hasSkinFactor: boolean;
    hiddenLines: string[];
    setHiddenLines: (values: string[]) => void;
}

export const Legend: FC<Props> = (props: Props) => {
    const { accumulated, accumHasOil, accumHasInj, hasOil, hasInj, hasSkinFactor, hiddenLines, setHiddenLines } = props;

    const legendClick = (key: string): void => {
        const newLines = any(equals(key), hiddenLines) ? reject(equals(key), hiddenLines) : append(key, hiddenLines);

        setHiddenLines(newLines);
    };

    const isHidden = (dataKey: string) => any(equals(dataKey), hiddenLines);

    return (
        <div className={cls([css.legend, 'legend_columned'])}>
            {accumulated ? (
                <>
                    {accumHasOil && (
                        <>
                            <Cell
                                text={Prm.accumulatedOilProduction()}
                                onClick={() => void legendClick('sumOilRateINSIM')}
                                color={cls([css.legend__cellThumb_oilrate, css.legend__cellThumb_solid])}
                                hidden={isHidden('sumOilRateINSIM')}
                                fill={ThumbFillEnum.Filled}
                            />
                            <Cell
                                text={Prm.accumulatedLiqRate()}
                                onClick={() => void legendClick('sumLiqRateINSIM')}
                                color={cls([css.legend__cellThumb_liqrate, css.legend__cellThumb_solid])}
                                hidden={isHidden('sumLiqRateINSIM')}
                                fill={ThumbFillEnum.Filled}
                            />
                        </>
                    )}
                    {accumHasInj && (
                        <Cell
                            text={Prm.accumulatedInjectionRate()}
                            onClick={() => void legendClick('sumInjectionINSIM')}
                            color={cls([css.legend__cellThumb_injection, css.legend__cellThumb_solid])}
                            hidden={isHidden('sumInjectionINSIM')}
                            fill={ThumbFillEnum.Filled}
                        />
                    )}
                </>
            ) : (
                <>
                    {hasOil && (
                        <Cell
                            text={Prm.oilrate()}
                            onClick={() => void legendClick('oilRateINSIM')}
                            color={cls([css.legend__cellThumb_oilrate, css.legend__cellThumb_solid])}
                            hidden={isHidden('oilRateINSIM')}
                            fill={ThumbFillEnum.Filled}
                        />
                    )}
                    <Cell
                        text={Prm.liqrate()}
                        onClick={() => void legendClick('liqRateINSIM')}
                        color={cls([css.legend__cellThumb_liqrate, css.legend__cellThumb_solid])}
                        hidden={isHidden('liqRateINSIM')}
                        fill={ThumbFillEnum.Filled}
                    />
                    {hasInj && (
                        <Cell
                            text={Prm.injectionRate()}
                            onClick={() => void legendClick('injectionINSIM')}
                            color={cls([css.legend__cellThumb_injection, css.legend__cellThumb_solid])}
                            hidden={isHidden('injectionINSIM')}
                            fill={ThumbFillEnum.Filled}
                        />
                    )}
                    <Cell
                        text={Prm.pressureZab()}
                        onClick={() => void legendClick('pressureZab')}
                        color={cls([css.legend__cellThumb_pressure, css.legend__cellThumb_solid])}
                        hidden={isHidden('pressureZab')}
                        fill={ThumbFillEnum.Filled}
                    />
                    <Cell
                        text={correctedPressureZabLabel}
                        onClick={() => void legendClick('correctedPressureZab')}
                        color={cls([css.legend__cellThumb_pressure])}
                        hidden={isHidden('correctedPressureZab')}
                        fill={ThumbFillEnum.Filled}
                    />
                    <Cell
                        text={Prm.watercut()}
                        onClick={() => void legendClick('volumeWaterCutINSIM')}
                        color={cls([css.legend__cellThumb_watercut, css.legend__cellThumb_solid])}
                        hidden={isHidden('volumeWaterCutINSIM')}
                        fill={ThumbFillEnum.Filled}
                    />
                    {hasSkinFactor && (
                        <Cell
                            text={Prm.skinFactor()}
                            onClick={() => void legendClick('skinFactor')}
                            color={cls([css.legend__cellThumb_skinfactor, css.legend__cellThumb_solid])}
                            hidden={isHidden('skinFactor')}
                            fill={ThumbFillEnum.Filled}
                        />
                    )}
                </>
            )}
        </div>
    );
};
