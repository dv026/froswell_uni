import React from 'react';

import { useRecoilCallback, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { isLoadingExportState } from '../../../../calculation/store/isLoadingExport';
import { scenariosWithResults } from '../../../../calculation/store/scenarios';
import { downloadFile } from '../../../../common/helpers/file';
import { hasValue } from '../../../../common/helpers/recoil';
import { ExportReportModal } from '../../../../commonEfficiency/components/exportReportModal';
import { ReportDataTypeEnum, ReportExportModel } from '../../../../commonEfficiency/entities/exportModel';
import { currentSpot } from '../../../store/well';
import { reportExport } from '../gateways/gateway';

export const ExportReport = () => {
    const wellLoadable = useRecoilValueLoadable(currentSpot);
    const scenariosLoadable = useRecoilValueLoadable(scenariosWithResults);

    const setIsLoading = useSetRecoilState(isLoadingExportState);

    const well = hasValue(wellLoadable) ? wellLoadable.contents : [];
    const scenarios = hasValue(scenariosLoadable) ? scenariosLoadable.contents : [];

    const defaultModel = new ReportExportModel(
        well.scenarioId,
        well.subScenarioId,
        well.prodObjId,
        null,
        true,
        ReportDataTypeEnum.AdaptationPlusPrediction,
        false
    );

    const exportCallback = useRecoilCallback(() => async (model: ReportExportModel) => {
        setIsLoading(true);

        const response = await reportExport(model);

        downloadFile(response);

        setIsLoading(false);
    });

    return <ExportReportModal model={defaultModel} scenarios={scenarios} export={exportCallback} />;
};
