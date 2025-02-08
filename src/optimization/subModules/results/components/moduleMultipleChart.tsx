import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { ChartDateRange } from 'common/components/chartDateRange';
import { ParamDate } from 'common/entities/paramDate';
import { ModeMapEnum } from 'common/enums/modeMapEnum';
import { gteByMonth, lteByMonth } from 'common/helpers/date';
import { mapIndexed, shallow } from 'common/helpers/ramda';
import { any, filter, head, map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { Range } from '../../../../common/entities/range';
import { ChartBestMainOData } from '../entities/chartBestMainOData';
import { modeMapTypeState } from '../store/modeMapType';
import { selectedWellNamesSelector } from '../store/selectedWells';
import { showRepairsState } from '../store/showRepairs';
import { chartBestMainOData, multipleWellDetailsSelector } from '../store/siteDetails';
import { ChartBestMainO } from './chart/bestMainO/chartBestMainO';
import { Legend } from './chart/bestMainO/legend';

export const ModuleMultipleChart = () => {
    const multipleData = useRecoilValue(multipleWellDetailsSelector);
    const plastId = useRecoilValue(currentPlastId);
    const showRepairs = useRecoilValue(showRepairsState);
    const modeMapType = useRecoilValue(modeMapTypeState);
    const selectedWellNames = useRecoilValue(selectedWellNamesSelector);

    const [hiddenLines, setHiddenLines] = React.useState<string[]>([]);

    const [dataSet, setDataSet] = useState<ChartBestMainOData[][]>([]);

    useEffect(() => {
        setDataSet(multipleData);
    }, [multipleData]);

    const initialRangeData = useMemo(
        () => map(it => ParamDate.fromRaw({ dt: it.date, value: it.oilRateINSIM }), head(multipleData) ?? []),
        [multipleData]
    );

    const onChangeRangeHandler = (current: Range<Date>) => {
        const result = map(
            (it: ChartBestMainOData[]) =>
                filter(x => gteByMonth(new Date(x.date), current.min) && lteByMonth(new Date(x.date), current.max), it),
            multipleData
        );
        setDataSet(result);
    };

    const data = head(dataSet);
    const hasPlast = plastId > 0;
    const hasInj = any(x => x.injectionINSIM > 0, data || []);
    const hasOil = any(x => x.liqRateINSIM > 0, data || []);
    const accumHasInj = any(x => x.sumInjectionINSIM > 0, data || []);
    const accumHasOil = any(x => x.sumLiqRateINSIM > 0, data || []);
    const hasSkinFactor = hasPlast;
    const accumulated = modeMapType === ModeMapEnum.Accumulated;
    const wellNames = map(it => it.name, selectedWellNames);

    return (
        <>
            {mapIndexed(
                (it: ChartBestMainOData[], index) => (
                    <Box key={index} height={'100%'}>
                        <Box position={'absolute'} ml={'90px'} mt={'10px'} fontWeight={'bold'}>
                            {wellNames?.[index]}
                        </Box>
                        <ChartBestMainO
                            initialChartData={it}
                            plastId={plastId}
                            showRepairs={showRepairs}
                            modeMapType={modeMapType}
                            multipleMode={true}
                            hiddenLines={hiddenLines}
                            setHiddenLines={setHiddenLines}
                        />
                    </Box>
                ),
                dataSet
            )}
            <ChartDateRange data={initialRangeData} onChange={onChangeRangeHandler} />
            <Legend
                accumulated={accumulated}
                accumHasOil={accumHasOil}
                accumHasInj={accumHasInj}
                hasOil={hasOil}
                hasInj={hasInj}
                hasSkinFactor={hasSkinFactor}
                hiddenLines={hiddenLines}
                setHiddenLines={setHiddenLines}
            />
        </>
    );
};
