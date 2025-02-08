import React, { useCallback, useEffect, useState } from 'react';

import { ParamDate } from 'common/entities/paramDate';
import { Range } from 'common/entities/range';
import { gteByMonth, lteByMonth, parseShortRU } from 'common/helpers/date';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { MultipleChart } from 'proxy/components/multipleChart';
import { ChartViewData } from 'proxy/subModules/results/entities/chartBuilder';
import { currentModeSelector } from 'proxy/subModules/results/store/currentMode';
import { multipleReportState } from 'proxy/subModules/results/store/multipleReport';
import { selectedWellNamesSelector, selectedWellsState } from 'proxy/subModules/results/store/selectedWells';
import { any, concat, filter, forEach, is, map, without } from 'ramda';
import { useRecoilValue } from 'recoil';

export const ModuleMultipleChart = () => {
    const wells = useRecoilValue(selectedWellsState);
    const selectedWellNames = useRecoilValue(selectedWellNamesSelector);

    const currentMode = useRecoilValue(currentModeSelector);
    const multipleReport = useRecoilValue(multipleReportState);

    const [hiddenLines, setHiddenLines] = useState<string[]>([]);
    const [viewData, setViewData] = useState<ChartViewData>();
    const [initialRangeData, setInitialRangeData] = useState<ParamDate[]>();
    const [data, setData] = useState([]);
    const [initialData, setInitialData] = useState([]);

    const updateLines = useCallback(
        (lines: string[] | string): void => {
            if (is(String)(lines)) {
                lines = [lines as string];
            }

            setHiddenLines(
                any(x => x === lines[0], hiddenLines)
                    ? without(lines as string[], hiddenLines) // убрать из скрытых линий -> отобразить
                    : concat(lines as string[], hiddenLines) // добавить в скрытые линии -> скрыть
            );
        },
        [hiddenLines]
    );

    useEffect(() => {
        let initialModel = [];

        forEach(report => {
            const model = currentMode?.render(
                report?.insim?.adaptations ?? [],
                report.dataType,
                hiddenLines,
                (lines: string[] | string) => updateLines(lines)
            );

            initialModel.push(model);
        }, multipleReport ?? []);

        if (!isNullOrEmpty(initialModel)) {
            setViewData(initialModel[0]);
            setInitialRangeData(
                map(
                    it => ParamDate.fromRaw({ dt: parseShortRU(it.date), value: it.oilrateCalc }),
                    initialModel[0]?.data ?? []
                )
            );

            setData(map(it => it?.data, initialModel));
            setInitialData(map(it => it?.data, initialModel));
        }
    }, [multipleReport, hiddenLines, currentMode, updateLines]);

    const onChangeRangeHandler = useCallback(
        (current: Range<Date>) => {
            setData(
                map(
                    it =>
                        filter(
                            (x: any) =>
                                gteByMonth(parseShortRU(x.date), current.min) &&
                                lteByMonth(parseShortRU(x.date), current.max),
                            it
                        ),
                    initialData
                )
            );
        },
        [initialData]
    );

    if (!viewData) {
        return null;
    }

    const wellNames = map(it => it.name, selectedWellNames);

    return (
        <MultipleChart
            initialRangeData={initialRangeData}
            data={data}
            viewData={viewData}
            disabled={hiddenLines}
            showRepairs={true}
            wells={wells}
            wellNames={wellNames}
            changeDisabledLines={setHiddenLines}
            onChangeRangeHandler={onChangeRangeHandler}
        />
    );
};
