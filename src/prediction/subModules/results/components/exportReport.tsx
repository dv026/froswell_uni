import React from 'react';

import { useRecoilCallback, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { ExportReportModal } from '../../../../calculation/components/results/modal/exportReportModal';
import { isLoadingExportState } from '../../../../calculation/store/isLoadingExport';
import { allPlasts } from '../../../../calculation/store/plasts';
import { scenariosWithResults } from '../../../../calculation/store/scenarios';
import { downloadFile } from '../../../../common/helpers/file';
import { hasValue } from '../../../../common/helpers/recoil';
import { currentSpot } from '../../../store/well';
import { ReportDataTypeEnum, ReportExportModel } from '../entities/exportModel';
import { reportExport } from '../gateways/gateway';

export const ExportReport = () => {
    const wellLoadable = useRecoilValueLoadable(currentSpot);
    const plastsLoadable = useRecoilValueLoadable(allPlasts);
    const scenariosLoadable = useRecoilValueLoadable(scenariosWithResults);

    const setIsLoading = useSetRecoilState(isLoadingExportState);

    const well = hasValue(wellLoadable) ? wellLoadable.contents : [];
    const plasts = hasValue(plastsLoadable) ? plastsLoadable.contents : [];
    const scenarios = hasValue(scenariosLoadable) ? scenariosLoadable.contents : [];

    const exportCallback = useRecoilCallback(() => async (model: ReportExportModel) => {
        setIsLoading(true);

        const response = await reportExport(model);

        downloadFile(response);

        setIsLoading(false);
    });

    const model = new ReportExportModel(
        well.scenarioId,
        well.subScenarioId,
        well.prodObjId,
        null,
        true,
        ReportDataTypeEnum.AdaptationPlusPrediction,
        false
    );

    return <ExportReportModal model={model} plasts={plasts} scenarios={scenarios} export={exportCallback} />;
};
