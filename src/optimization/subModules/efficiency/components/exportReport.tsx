import React from 'react';

import { useRecoilCallback, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { ExportReportEfficiencyModal } from '../../../../calculation/components/results/modal/exportReportEfficiencyModal';
import { isLoadingExportState } from '../../../../calculation/store/isLoadingExport';
import { allPlasts } from '../../../../calculation/store/plasts';
import { scenariosWithResults } from '../../../../calculation/store/scenarios';
import { downloadFile } from '../../../../common/helpers/file';
import { hasValue } from '../../../../common/helpers/recoil';
import { reportExport } from '../../../../prediction/subModules/efficiency/gateways/gateway';
import { ReportExportEfficiencyModel } from '../../../../prediction/subModules/results/entities/exportEfficiencyModel';
import { currentSpot } from '../../../store/well';

export const ExportReport = () => {
    const wellLoadable = useRecoilValueLoadable(currentSpot);
    const plastsLoadable = useRecoilValueLoadable(allPlasts);
    const scenariosLoadable = useRecoilValueLoadable(scenariosWithResults);

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
        null,
        well.id,
        true
    );

    return <ExportReportEfficiencyModal model={model} plasts={plasts} scenarios={scenarios} export={exportCallback} />;
};
