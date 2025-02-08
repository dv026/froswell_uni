import React, { useEffect } from 'react';

import { MultipleChart } from 'common/components/multipleChart';
import { isInj, WellTypeEnum } from 'common/enums/wellTypeEnum';
import { computeCorrelationCoefficients } from 'common/helpers/correlation';
import { addMonth, isBetweenTwoDates } from 'common/helpers/date';
import { forEachIndexed, isNullOrEmpty, shallow } from 'common/helpers/ramda';
import { isNumber } from 'common/helpers/types';
import { chartCompareSyncMode } from 'input/store/chart/chartCompareSyncMode';
import { chartMultipleMersSelector, columnsSelector } from 'input/store/chart/chartModel';
import { disabledLinesInjectionState, disabledLinesOilState } from 'input/store/chart/disabledLines';
import { showRepairsState } from 'input/store/chart/showRepairs';
import { selectedWellNamesSelector, selectedWellsState } from 'input/store/selectedWells';
import { any, head, map, slice, take } from 'ramda';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { WithDate } from '../../input/entities/merModel';

export interface CorrelationItem {
    startDate: Date;
    endDate: Date;
    value: number;
}

export const ModuleMultipleChart = () => {
    const columns = useRecoilValue(columnsSelector);
    const wells = useRecoilValue(selectedWellsState);
    const sorted = useRecoilValue(chartMultipleMersSelector);
    const showRepairs = useRecoilValue(showRepairsState);
    const selectedWellNames = useRecoilValue(selectedWellNamesSelector);
    const syncMode = useRecoilValue(chartCompareSyncMode);

    const [disabledLinesOil, setDisabledLinesOil] = useRecoilState(disabledLinesOilState);
    const [disabledLinesInjection, setDisabledLinesInjection] = useRecoilState(disabledLinesInjectionState);

    const resetselectedWells = useResetRecoilState(selectedWellsState);

    useEffect(() => {
        return () => {
            resetselectedWells();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const well = head(wells);

    const changeDisabledLines = (list: Array<string>) => {
        if (isInj(well.charWorkId)) {
            setDisabledLinesInjection(list);
        } else {
            setDisabledLinesOil(list);
        }
    };

    const disabled = isInj(well?.charWorkId) ? disabledLinesInjection : disabledLinesOil;

    const wellNames = map(it => it.name, selectedWellNames);

    const localCorrelation = () => {
        if (isNullOrEmpty(sorted) || sorted.length < 2) {
            return [];
        }

        const result: CorrelationItem[] = [];

        const corrPeriod = 6;
        const corrLimit = 0.8;

        const firstSorted = head(sorted);
        const cropSorted = take(Math.max(firstSorted.length - corrPeriod, 0), firstSorted);

        for (let i = 0; i < cropSorted.length; i++) {
            const res = [];
            forEachIndexed((it: WithDate[], index: number) => {
                const well = wells[index];
                const d = map(
                    (x: any) => (well.charWorkId === WellTypeEnum.Injection ? x.injectionRate : x.liquidVolumeRate),
                    slice(i, i + corrPeriod, it)
                );

                if (!isNullOrEmpty(d)) {
                    res.push(d);
                }
            }, sorted);

            const correlationMatrix = computeCorrelationCoefficients(...res);

            if (isNumber(correlationMatrix) && correlationMatrix >= corrLimit) {
                if (!any(it => isBetweenTwoDates(cropSorted[i]?.dt, [it.startDate, it.endDate]), result)) {
                    result.push({
                        startDate: cropSorted[i]?.dt,
                        endDate: addMonth(cropSorted[i]?.dt, corrPeriod),
                        value: correlationMatrix
                    });
                }
            }
        }

        return result;
    };

    const corr = localCorrelation();

    // convert dt to number
    const data = map((g: any) => map((it: any) => shallow(it, { dt: new Date(it.dt).getTime() }), g), sorted);

    return (
        <>
            <MultipleChart
                columns={columns}
                data={data}
                disabled={disabled}
                showRepairs={showRepairs}
                wells={wells}
                wellNames={wellNames}
                referenceLines={corr}
                sync={syncMode}
                changeDisabledLines={changeDisabledLines}
            />
        </>
    );
};
