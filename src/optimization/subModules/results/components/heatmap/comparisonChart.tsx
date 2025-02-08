import React, { FC, useEffect, useState } from 'react';

import { Box, HStack } from '@chakra-ui/react';
import { min, max } from 'd3';
import { ascend, filter, head, isNil, map, prop, sortWith } from 'ramda';
import { useRecoilValue } from 'recoil';

import colors from '../../../../../../theme/colors';
import { FavoriteIcon } from '../../../../../common/components/customIcon/general';
import { DownIcon, DropIcon } from '../../../../../common/components/customIcon/tree';
import { EmptyData } from '../../../../../common/components/emptyData';
import { round1 } from '../../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { cls } from '../../../../../common/helpers/styles';
import { HeatmapRaw } from '../../entities/heatMapRaw';
import { HeatmapAccumulatedRaw } from '../../entities/heatmapAccumulatedRaw';
import { HeatmapGroupRaw } from '../../entities/heatmapGroupRaw';
import { heatmapSettingsState } from '../../store/heatmapSettings';
import { HeatmapChart } from './heatmapChart';
import { Legend } from './legend';

import css from './index.module.less';

export interface HeatmapModel {
    min: number;
    max: number;
    names: string[];
    accumulated: string[];
    changes: string[];
    accumulatedAndChanges: string[][];
    values: number[][];
    groups: number[][];
}

export interface HeatmapYearModel extends Omit<HeatmapModel, 'min' | 'max' | 'chartOptions'> {
    year: number;
    years: number[];
}

export const ComparisonChart = () => {
    const heatmap = useRecoilValue(heatmapSettingsState);

    const [oilNames, setOilNames] = useState<string[]>(null);
    const [injNames, setInjNames] = useState<string[]>(null);
    const [data, setData] = useState<HeatmapRaw[]>(null);

    useEffect(() => {
        if (isNil(heatmap) || isNullOrEmpty(heatmap.data)) {
            return;
        }

        const filtered = sortWith<HeatmapRaw>(
            [ascend(prop('groupId')), ascend(prop('wellId')), ascend(prop('dt')), ascend(prop('wellName'))],
            heatmap.data
        );

        setOilNames(heatmap.oilNames);
        setInjNames(heatmap.injNames);
        setData(filtered);
        // TODO: проверить правильность выставления зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [heatmap.data]);

    const allData = () => data ?? [];
    const liqRateData = () => map(it => it.liqRate, allData());
    const injectionData = () => map(it => it.injection, allData());

    const minLiqRate = () => min(liqRateData());
    const maxLiqRate = () => max(liqRateData());
    const minInjection = () => min(injectionData());
    const maxInjection = () => max(injectionData());

    const oilFindIndex = (name: string) => oilNames?.findIndex(n => n === name);
    const injFindIndex = (name: string) => injNames?.findIndex(n => n === name);

    const genOilData = mainO =>
        ({
            min: minLiqRate(),
            max: maxLiqRate(),
            names: oilNames,
            accumulated: map(
                (it: HeatmapAccumulatedRaw) => round1(it.totalOilRate / 1000).toString(),
                filter((x: HeatmapAccumulatedRaw) => x.mainO === mainO, heatmap.oilAccumulated ?? [])
            ),
            changes: map(it => `(${it > 0 ? '+' : ''}${it})`, getOilRateChanges(mainO)),
            values: map(
                (x: HeatmapRaw) => [new Date(x.dt).getTime(), oilFindIndex(x.wellName), x.liqRate],
                filter((x: HeatmapRaw) => x.mainO === mainO, allData())
            ),
            groups: map(
                (x: HeatmapGroupRaw) => [oilFindIndex(x.wells[0]), x.wells.length],
                filter((it: HeatmapGroupRaw) => it.mainO === mainO && it.wells.length > 0, heatmap.oilGroups)
            )
        } as HeatmapModel);

    const genInjData = mainO =>
        ({
            min: minInjection(),
            max: maxInjection(),
            names: injNames,
            accumulated: map(
                (it: HeatmapAccumulatedRaw) => round1(it.totalInjection / 1000).toString(),
                filter((x: HeatmapAccumulatedRaw) => x.mainO === mainO, heatmap.injAccumulated ?? [])
            ),
            changes: map(it => `(${it > 0 ? '+' : ''}${it})`, getInjectionChanges(mainO)),
            values: map(
                (x: HeatmapRaw) => [new Date(x.dt).getTime(), injFindIndex(x.wellName), x.injection],
                filter((x: HeatmapRaw) => x.mainO === mainO, allData())
            ),
            groups: map(
                (x: HeatmapGroupRaw) => [injFindIndex(x.wells[0]), x.wells.length],
                filter((it: HeatmapGroupRaw) => it.mainO === mainO && it.wells.length > 0, heatmap.injGroups)
            )
        } as HeatmapModel);

    const getOilRateChanges = mainO =>
        map(
            (it: HeatmapAccumulatedRaw) =>
                round1(
                    (it.totalOilRate -
                        head(
                            map(
                                (x: HeatmapAccumulatedRaw) => x.totalOilRate,
                                filter(
                                    (x: HeatmapAccumulatedRaw) => x.mainO === 0 && x.wellName === it.wellName,
                                    heatmap.oilAccumulated ?? []
                                )
                            )
                        )) /
                        1000
                ),
            filter((x: HeatmapAccumulatedRaw) => x.mainO === mainO, heatmap.oilAccumulated ?? [])
        );

    const getInjectionChanges = mainO =>
        map(
            (it: HeatmapAccumulatedRaw) =>
                round1(
                    (it.totalInjection -
                        head(
                            map(
                                (x: HeatmapAccumulatedRaw) => x.totalInjection,
                                filter(
                                    (x: HeatmapAccumulatedRaw) => x.mainO === 0 && x.wellName === it.wellName,
                                    heatmap.injAccumulated ?? []
                                )
                            )
                        )) /
                        1000
                ),
            filter((x: HeatmapAccumulatedRaw) => x.mainO === mainO, heatmap.injAccumulated ?? [])
        );

    const commonTotalValue = (accum: HeatmapAccumulatedRaw, prop: string, unit: string) => {
        const value = round1(accum[prop] / 1000);

        if (accum.mainO === 0) {
            return `${value} ${unit}`;
        }

        const baseValue = head(
            map(
                x => x[prop],
                filter((x: HeatmapAccumulatedRaw) => x.mainO === 0, heatmap.accumulatedByMainO)
            )
        );

        const changes = round1((accum[prop] - baseValue) / 1000);

        return `${value} (${changes > 0 ? '+' : ''}${changes})  ${unit}`;
    };

    const isBest = mainO => mainO === heatmap.bestMainO;

    const optionClassHeader = mainO => cls(css.comparison__option_header, isBest(mainO) && '' /*&& css.best*/);

    return (
        <div className={css.comparison}>
            {!isNullOrEmpty(data) ? (
                <div className={css.comparison__legend}>
                    <Legend key='legend-oil' min={0} max={maxLiqRate()} title={'Нефтяные скважины'}></Legend>
                    <Legend key='legend-inj' min={0} max={maxInjection()} title={'Нагнетательные скважины'}></Legend>
                </div>
            ) : null}
            <div className={css.comparison__options}>
                {map((accum: HeatmapAccumulatedRaw) => {
                    const heatmapOilData = genOilData(accum.mainO);
                    const heatmapInjData = genInjData(accum.mainO);

                    return (
                        <div key={accum.wellId} className={css.comparison__option}>
                            <div className={optionClassHeader(accum.mainO)}>
                                Вариант {accum.mainO}
                                {accum.mainO === 0 ? (
                                    '(базовый)'
                                ) : isBest(accum.mainO) ? (
                                    <FavoriteIcon boxSize={6} color={colors.bg.brand} />
                                ) : (
                                    ''
                                )}
                            </div>
                            <div className={css.comparison__option_indicators}>
                                <p>Накопленные показатели:</p>
                                <HStack spacing={6} pt={2}>
                                    <Box>
                                        <DropIcon boxSize={7} color={colors.paramColors.oil} />
                                        {commonTotalValue(accum, 'totalOilRate', 'тыс. тонн')}
                                    </Box>
                                    <Box>
                                        <DropIcon boxSize={7} color={colors.paramColors.liquid} />
                                        {commonTotalValue(accum, 'totalLiqRate', 'тыс. тонн')}
                                    </Box>
                                    <Box>
                                        <DownIcon boxSize={7} color={colors.paramColors.injection} />
                                        {commonTotalValue(accum, 'totalInjection', 'тыс. м3')}
                                    </Box>
                                </HStack>
                            </div>
                            <div className={css.comparison__option_chart}>
                                <div className={css.fundTitle}>Добывающий фонд</div>
                                {isNullOrEmpty(heatmapOilData.names) ? (
                                    <EmptyData />
                                ) : (
                                    <HeatmapChart
                                        key={'heatmap-liqrate'}
                                        data={heatmapOilData}
                                        title={`MainO = ${accum.mainO}`}
                                        isOil={true}
                                    />
                                )}
                            </div>
                            <div className={css.comparison__option_chart}>
                                <div className={css.fundTitle}>Нагнетательный фонд</div>
                                {isNullOrEmpty(heatmapInjData.names) ? (
                                    <EmptyData />
                                ) : (
                                    <HeatmapChart
                                        key={'heatmap-liqrate'}
                                        data={heatmapInjData}
                                        title={`MainO = ${accum.mainO}`}
                                        isOil={false}
                                    />
                                )}
                            </div>
                        </div>
                    );
                }, heatmap.accumulatedByMainO)}
            </div>
        </div>
    );
};
