import React, { FC } from 'react';

import { ModuleMultipleChart } from 'proxy/components/moduleMultipleChart';
import { any, filter, includes } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { ModuleCompareChart } from '../../../components/compareChart';
import { NeighborINSIM, WellINSIM } from '../../../entities/insim/well';
import { currentSpot } from '../../../store/well';
import { GraphViewParam } from '../enums/graphViewParam';
import { chartCompareState } from '../store/chartCompare';
import { reportState } from '../store/report';
import { viewTypeSelector } from '../store/viewType';
import { сurrentParamIdState } from '../store/сurrentParamId';
import { ChartData } from './chartData';
import { ChartSelector } from './chartSelector';

import css from './common.module.less';

export const ChartResults = () => {
    const report = useRecoilValue(reportState);
    const viewType = useRecoilValue(viewTypeSelector);
    const well = useRecoilValue(currentSpot);
    const compareParam = useRecoilValue(chartCompareState);

    const [currentParamId, setCurrentParamId] = useRecoilState(сurrentParamIdState);

    if (!report || isNullOrEmpty(report?.insim?.adaptations)) {
        return null;
    }

    if (compareParam === ChartCompareEnum.Multiple) {
        return (
            <div className={css.results}>
                <div className={css.results__chartWrapper}>
                    <ModuleMultipleChart />
                </div>
            </div>
        );
    }

    if (compareParam !== ChartCompareEnum.Sum) {
        return (
            <div className={css.results}>
                <div className={css.results__chartWrapper}>
                    <ModuleCompareChart />
                </div>
            </div>
        );
    }

    const wellName = well.id ? well.id.toString() : null; // todo mb

    const chartsData = report?.insim?.adaptations ?? [];

    const neighbors = chartsData[0].defaultNeighbors();

    return (
        <div className={css.results}>
            <div className={css.results__chartWrapper}>
                <ChartData />
            </div>
            {includes(viewType, [GraphViewParam.Saturation, GraphViewParam.Transmissibility, GraphViewParam.Fbl]) ? (
                <div className={css.results__paramsWrapper}>
                    <div className={css.results__params}>
                        <ChartSelector
                            currentId={currentParamId}
                            neighborInfos={report.neighbors}
                            neighbors={neighbors}
                            saturationNeighbors={saturationNeighbors(report.insim, neighbors)}
                            onClick={setCurrentParamId}
                            plasts={report.plasts}
                            wellName={wellName}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const saturationNeighbors = (well: WellINSIM, neighbors: NeighborINSIM[]) =>
    filter(
        x => any(y => x.wellId === y.neighborWellId && x.plastId === y.plastId, well?.frontTracking?.neighbors || []),
        neighbors || []
    );
