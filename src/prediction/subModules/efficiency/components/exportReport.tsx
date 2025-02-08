import React from 'react';

import { useRecoilCallback, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { ExportReportEfficiencyModal } from '../../../../calculation/components/results/modal/exportReportEfficiencyModal';
import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { isLoadingExportState } from '../../../../calculation/store/isLoadingExport';
import { allPlasts } from '../../../../calculation/store/plasts';
import { scenariosWithResults } from '../../../../calculation/store/scenarios';
import { downloadFile } from '../../../../common/helpers/file';
import { hasValue } from '../../../../common/helpers/recoil';
import { currentSpot } from '../../../store/well';
import { reportExport } from '../../efficiency/gateways/gateway';
import { ReportExportEfficiencyModel } from '../../results/entities/exportEfficiencyModel';

export const ExportReport = () => {
    const wellLoadable = useRecoilValueLoadable(currentSpot);
    const plastsLoadable = useRecoilValueLoadable(allPlasts);
    const scenariosLoadable = useRecoilValueLoadable(scenariosWithResults);

    const plastId = useRecoilValue(currentPlastId);

    const setIsLoading = useSetRecoilState(isLoadingExportState);

    const well = hasValue(wellLoadable) ? wellLoadable.contents : [];
    const plasts = hasValue(plastsLoadable) ? plastsLoadable.contents : [];
    const scenarios = hasValue(scenariosLoadable) ? scenariosLoadable.contents : [];

    const exportCallback = useRecoilCallback(() => async (model: ReportExportEfficiencyModel) => {
        setIsLoading(true);

        const response = await reportExport(model);

        downloadFile(response);

        setIsLoading(false);
    });

    const model = new ReportExportEfficiencyModel(
        well.scenarioId,
        well.subScenarioId,
        well.prodObjId,
        plastId,
        well.id,
        false
    );

    return <ExportReportEfficiencyModal model={model} plasts={plasts} scenarios={scenarios} export={exportCallback} />;
};
