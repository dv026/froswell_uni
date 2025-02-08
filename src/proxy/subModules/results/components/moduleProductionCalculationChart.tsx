import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { groupByProp } from 'common/helpers/ramda';
import { PlastInfo } from 'proxy/entities/report/plastInfo';
import { filter, includes, map } from 'ramda';
import { useRecoilValue } from 'recoil';

import { ProductionCalculationChart } from '../../../../calculation/components/results/productionCalculationChart';
import { reportState, reserveDevelopmentSelector } from '../store/report';

import commonCss from './common.module.less';

interface IProps {
    currentParamId: string;
    plastId: number;
}

export const ModuleProductionCalculationChart: FC<IProps> = (p: IProps) => {
    const report = useRecoilValue(reportState);
    const reserve = useRecoilValue(reserveDevelopmentSelector);

    if (includes('bestby', p.currentParamId)) {
        const allowPlasts = Object.keys(groupByProp('plastId', reserve.productionCalculationByPlasts ?? []));

        return (
            <>
                {map(
                    (p: PlastInfo) => (
                        <Box key={p.id} className={commonCss.results__chart}>
                            <ProductionCalculationChart
                                data={filter(it => it.plastId === p.id, reserve.productionCalculationByPlasts)}
                                dataAvg={reserve.productionCalculationAvg}
                                plastName={p.name}
                            />
                        </Box>
                    ),
                    filter(it => includes(it.id.toString(), allowPlasts), report.plasts)
                )}
            </>
        );
    }

    const data = p.plastId
        ? filter(it => it.plastId === p.plastId, reserve.productionCalculationByPlasts)
        : reserve.productionCalculation;
    const dataAvg = p.plastId
        ? filter(it => it.plastId === p.plastId, reserve.productionCalculationAvgByPlasts)
        : reserve.productionCalculationAvg;

    return (
        <Box className={commonCss.results__chart}>
            <ProductionCalculationChart data={data} dataAvg={dataAvg} />
        </Box>
    );
};
