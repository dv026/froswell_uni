import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { ChartDateRange } from 'common/components/chartDateRange';
import { ParamDate } from 'common/entities/paramDate';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { gteByMonth, lteByMonth } from 'common/helpers/date';
import { isNullOrEmpty, mapIndexed, shallow } from 'common/helpers/ramda';
import { PlastPropsDynamic } from 'prediction/entities/wellDetailsModel';
import { filter, head, isNil, map, not } from 'ramda';
import { useRecoilValue } from 'recoil';

import { Range } from '../../../../common/entities/range';
import { ChartItem } from '../entities/chartItem';
import { currentPlastId } from '../store/currentPlastId';
import { modeMapTypeState } from '../store/modeMapType';
import { selectedWellNamesSelector } from '../store/selectedWells';
import { showRepairsState } from '../store/showRepairs';
import { multipleWellDetailsSelector } from '../store/wellDetails';
import { getInitialChartData, Legend, PrimaryChart } from './primaryChart';

export const ModuleMultipleChart = () => {
    const modeMapType = useRecoilValue(modeMapTypeState);
    const plastId = useRecoilValue(currentPlastId);
    const showRepairs = useRecoilValue(showRepairsState);
    const multipleWellDetails = useRecoilValue(multipleWellDetailsSelector);
    const selectedWellNames = useRecoilValue(selectedWellNamesSelector);

    const [hiddenLines, setHiddenLines] = useState<string[]>(['skinFactorCalc', 'skinFactorReal']);

    const [dataSet, setDataSet] = useState<PlastPropsDynamic[][]>([]);

    const wellDetails = head(multipleWellDetails);

    useEffect(() => {
        setDataSet(map(it => it.data, multipleWellDetails));
    }, [multipleWellDetails]);

    const initialRangeData = useMemo(
        () =>
            map((it: ChartItem) => ParamDate.fromRaw({ dt: it.date, value: it.oilrateCalc }))(
                getInitialChartData(wellDetails.data, wellDetails.id, plastId, modeMapType)
            ),
        [modeMapType, plastId, wellDetails]
    );

    if (isNullOrEmpty(dataSet)) {
        return null;
    }

    const byWellMode = not(isNil(wellDetails?.id));
    const byPlastMode = plastId > 0;
    const isAccumulated = modeMapType === ModeMapEnum.Accumulated;

    const onChangeRangeHandler = (current: Range<Date>) => {
        const result = map(
            (ds: PlastPropsDynamic[]) =>
                map(
                    d =>
                        shallow(d, {
                            plastId: d.plastId,
                            properties: filter(
                                x => gteByMonth(x.date, current.min) && lteByMonth(x.date, current.max),
                                d.properties
                            )
                        }),
                    ds
                ),
            map(it => it.data, multipleWellDetails)
        );

        setDataSet(result);
    };

    const wellNames = map(it => it.name, selectedWellNames);

    return (
        <>
            {mapIndexed(
                (it: PlastPropsDynamic[], index) => (
                    <Box key={index} height={'100%'}>
                        <Box position={'absolute'} ml={'90px'} mt={'10px'} fontWeight={'bold'}>
                            {wellNames?.[index]}
                        </Box>
                        <PrimaryChart
                            data={getInitialChartData(it, wellDetails.id, plastId, modeMapType)}
                            modeMapType={modeMapType}
                            multipleMode={true}
                            plastId={plastId}
                            showRepairs={showRepairs}
                            wellId={wellDetails.id}
                            hiddenLines={hiddenLines}
                            setHiddenLines={setHiddenLines}
                        />
                    </Box>
                ),
                dataSet
            )}
            <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />
            <Legend
                byWell={byWellMode}
                byPlast={byPlastMode}
                isAccumulated={isAccumulated}
                hiddenLines={hiddenLines}
                setHiddenLines={setHiddenLines}
            />
        </>
    );
};
